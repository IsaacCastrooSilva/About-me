package com.isaac.portfolioai.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/*
 * Limite simples de requisições por IP para o chat, em memória.
 * Protege a cota das APIs de IA contra uso abusivo. Como fica em
 * memória, o contador zera quando o servidor reinicia, o que basta
 * para uma única instância.
 *
 * Além do limite por IP, há um limite global: como cabeçalhos de IP
 * podem ser falsificados, ele garante um teto de uso das APIs.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long JANELA_MS = 60_000;
    private static final int MAX_IPS_RASTREADOS = 10_000;

    private final int limitePorMinuto;
    private final int limiteGlobalPorMinuto;
    private final Map<String, Deque<Long>> acessos =
            new ConcurrentHashMap<>();
    private final Deque<Long> acessosGlobais =
            new ArrayDeque<>();

    public RateLimitFilter(
            @Value("${app.chat.rate-limit-per-minute}") int limitePorMinuto,
            @Value("${app.chat.global-rate-limit-per-minute}") int limiteGlobalPorMinuto
    ) {
        this.limitePorMinuto = limitePorMinuto;
        this.limiteGlobalPorMinuto = limiteGlobalPorMinuto;
    }

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {
        return !"POST".equalsIgnoreCase(request.getMethod())
                || !request.getRequestURI().startsWith("/api/chat");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        long agora = System.currentTimeMillis();

        if (acessos.size() > MAX_IPS_RASTREADOS) {
            limparExpirados(agora);
        }

        Deque<Long> fila =
                acessos.computeIfAbsent(
                        ipDoCliente(request),
                        ip -> new ArrayDeque<>()
                );

        boolean permitido;

        synchronized (fila) {
            permitido = registrar(fila, limitePorMinuto, agora);
        }

        if (permitido) {
            synchronized (acessosGlobais) {
                permitido = registrar(acessosGlobais, limiteGlobalPorMinuto, agora);
            }
        }

        if (!permitido) {
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/json");
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write(
                    "{\"error\":\"Muitas perguntas seguidas. Aguarde um minuto.\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    /*
     * Remove acessos fora da janela e, se ainda houver espaço,
     * registra o acesso atual. Deve ser chamado com a fila travada.
     */
    private static boolean registrar(
            Deque<Long> fila,
            int limite,
            long agora
    ) {
        while (!fila.isEmpty() && agora - fila.peekFirst() >= JANELA_MS) {
            fila.pollFirst();
        }

        if (fila.size() >= limite) {
            return false;
        }

        fila.addLast(agora);
        return true;
    }

    /*
     * O Render fica atrás da Cloudflare, que define CF-Connecting-IP
     * com o IP real do visitante. Sem esse cabeçalho, usa o primeiro
     * IP de X-Forwarded-For ou o endereço da conexão.
     */
    private static String ipDoCliente(
            HttpServletRequest request
    ) {
        String cloudflare = request.getHeader("CF-Connecting-IP");

        if (cloudflare != null && !cloudflare.isBlank()) {
            return cloudflare.trim();
        }

        String encaminhado = request.getHeader("X-Forwarded-For");

        if (encaminhado != null && !encaminhado.isBlank()) {
            return encaminhado.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    private void limparExpirados(
            long agora
    ) {
        acessos.entrySet().removeIf(entrada -> {
            Deque<Long> fila = entrada.getValue();
            synchronized (fila) {
                return fila.isEmpty() || agora - fila.peekLast() >= JANELA_MS;
            }
        });
    }
}
