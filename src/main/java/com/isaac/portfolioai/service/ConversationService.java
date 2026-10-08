package com.isaac.portfolioai.service;

import com.isaac.portfolioai.entity.MessageEntity;
import com.isaac.portfolioai.model.ConversationMemory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConversationService {

    private static final int LIMITE_MEMORIA = 30;
    private static final int JANELA_CONTEXTO_LLM = 8;

    private final ConversationPersistenceService persistenceService;

    private final ConversationMemoryPersistenceService
            memoryPersistenceService;

    private final Map<String, List<Mensagem>> conversas =
            new ConcurrentHashMap<>();

    private final Map<String, ConversationMemory> memorias =
            new ConcurrentHashMap<>();


    public ConversationService(
            ConversationPersistenceService persistenceService,
            ConversationMemoryPersistenceService memoryPersistenceService
    ) {
        this.persistenceService = persistenceService;
        this.memoryPersistenceService = memoryPersistenceService;
    }


    public void adicionarMensagemUsuario(
            String conversationId,
            String mensagem
    ) {
        adicionarMensagem(
                conversationId,
                "user",
                mensagem
        );
    }


    public void adicionarMensagemAssistente(
            String conversationId,
            String mensagem
    ) {
        adicionarMensagem(
                conversationId,
                "assistant",
                mensagem
        );
    }


    public String obterHistorico(
            String conversationId
    ) {

        garantirHistoricoCarregado(conversationId);

        String historicoRecente =
                obterJanelaFormatada(
                        conversationId,
                        JANELA_CONTEXTO_LLM
                );

        ConversationMemory memoria =
                obterMemoria(conversationId);

        if (!memoria.possuiResumo()) {
            return historicoRecente;
        }

        if (historicoRecente.isBlank()) {
            return """
                    CONTEXTO ANTERIOR DA CONVERSA:
                    %s
                    """.formatted(
                    memoria.getResumo()
            ).trim();
        }

        return """
                CONTEXTO ANTERIOR DA CONVERSA:
                %s

                HISTÓRICO RECENTE:
                %s
                """.formatted(
                memoria.getResumo(),
                historicoRecente
        ).trim();
    }


    public String obterContextoParaRag(
            String conversationId
    ) {

        garantirHistoricoCarregado(conversationId);

        List<Mensagem> historico =
                conversas.get(conversationId);

        if (
                historico == null
                        || historico.isEmpty()
        ) {
            return "";
        }

        List<String> ultimasPerguntas =
                new ArrayList<>();

        synchronized (historico) {

            for (
                    int i = historico.size() - 1;
                    i >= 0;
                    i--
            ) {

                Mensagem mensagem =
                        historico.get(i);

                if (
                        mensagem.role()
                                .equals("user")
                ) {

                    ultimasPerguntas.add(
                            0,
                            mensagem.conteudo()
                    );
                }

                if (
                        ultimasPerguntas.size()
                                >= 2
                ) {
                    break;
                }
            }
        }

        if (ultimasPerguntas.isEmpty()) {
            return "";
        }

        StringBuilder contexto =
                new StringBuilder();

        for (
                int i = 0;
                i < ultimasPerguntas.size();
                i++
        ) {

            contexto.append(
                    "PERGUNTA ANTERIOR "
            );

            contexto.append(i + 1);
            contexto.append(": ");
            contexto.append(
                    ultimasPerguntas.get(i)
            );
            contexto.append("\n");
        }

        return contexto
                .toString()
                .trim();
    }


    public List<String> obterPerguntasParaResumo(
            String conversationId
    ) {

        garantirHistoricoCarregado(conversationId);

        List<Mensagem> historico =
                conversas.get(conversationId);

        List<String> perguntas =
                new ArrayList<>();

        if (historico == null) {
            return perguntas;
        }

        synchronized (historico) {

            if (
                    historico.size()
                            <= JANELA_CONTEXTO_LLM
            ) {
                return perguntas;
            }

            int limite =
                    historico.size()
                            - JANELA_CONTEXTO_LLM;

            for (
                    int i = 0;
                    i < limite;
                    i++
            ) {

                Mensagem mensagem =
                        historico.get(i);

                if (
                        mensagem.role()
                                .equals("user")
                ) {

                    perguntas.add(
                            mensagem.conteudo()
                    );
                }
            }
        }

        return perguntas;
    }


    public int compactarHistorico(
            String conversationId
    ) {

        List<Mensagem> historico =
                conversas.get(conversationId);

        if (historico == null) {
            return 0;
        }

        synchronized (historico) {

            int quantidadeRemover =
                    Math.max(
                            0,
                            historico.size()
                                    - JANELA_CONTEXTO_LLM
                    );

            if (quantidadeRemover == 0) {
                return 0;
            }

            /*
             * Remove somente da RAM.
             * As mensagens continuam persistidas no H2.
             */
            historico.subList(
                    0,
                    quantidadeRemover
            ).clear();

            return quantidadeRemover;
        }
    }


    public ConversationMemory obterMemoria(
            String conversationId
    ) {

        if (
                conversationId == null
                        || conversationId.isBlank()
        ) {
            return new ConversationMemory();
        }

        return memorias.computeIfAbsent(
                conversationId,
                id -> memoryPersistenceService
                        .buscar(id)
                        .orElseGet(
                                ConversationMemory::new
                        )
        );
    }


    public void atualizarResumo(
            String conversationId,
            String resumo,
            int mensagensResumidas
    ) {

        ConversationMemory memoria =
                obterMemoria(conversationId);

        memoria.setResumo(resumo);

        memoria.setMensagensResumidas(
                mensagensResumidas
        );

        /*
         * O resumo atualizado também é salvo
         * de forma persistente no H2.
         */
        persistirMemoria(
                conversationId,
                memoria
        );
    }


    public void persistirMemoria(
            String conversationId
    ) {

        ConversationMemory memoria =
                obterMemoria(conversationId);

        persistirMemoria(
                conversationId,
                memoria
        );
    }


    public int quantidadeMensagens(
            String conversationId
    ) {

        garantirHistoricoCarregado(conversationId);

        List<Mensagem> historico =
                conversas.get(conversationId);

        if (historico == null) {
            return 0;
        }

        synchronized (historico) {
            return historico.size();
        }
    }


    public void limparHistorico(
            String conversationId
    ) {

        /*
         * Limpa somente o cache da sessão em RAM.
         *
         * O histórico e a memória persistidos
         * continuam armazenados no H2.
         */
        conversas.remove(conversationId);
        memorias.remove(conversationId);
    }


    private String obterJanelaFormatada(
            String conversationId,
            int tamanhoJanela
    ) {

        garantirHistoricoCarregado(conversationId);

        List<Mensagem> historico =
                conversas.get(conversationId);

        if (
                historico == null
                        || historico.isEmpty()
        ) {
            return "";
        }

        List<Mensagem> mensagensRecentes;

        synchronized (historico) {

            int inicio =
                    Math.max(
                            0,
                            historico.size()
                                    - tamanhoJanela
                    );

            mensagensRecentes =
                    new ArrayList<>(
                            historico.subList(
                                    inicio,
                                    historico.size()
                            )
                    );
        }

        StringBuilder resultado =
                new StringBuilder();

        for (
                Mensagem mensagem
                : mensagensRecentes
        ) {

            /*
             * Para o contexto enviado à LLM,
             * utilizamos somente mensagens do usuário.
             *
             * Respostas anteriores da IA continuam
             * persistidas no banco, mas não são usadas
             * como fonte de contexto factual.
             *
             * Isso evita que uma informação inventada
             * anteriormente pela própria IA seja
             * reforçada em respostas futuras.
             */
            if (
                    !mensagem.role()
                            .equals("user")
            ) {
                continue;
            }

            resultado.append(
                    "USUÁRIO: "
            );

            resultado.append(
                    mensagem.conteudo()
            );

            resultado.append("\n");
        }

        return resultado
                .toString()
                .trim();
    }


    private void adicionarMensagem(
            String conversationId,
            String role,
            String conteudo
    ) {

        if (
                conversationId == null
                        || conversationId.isBlank()
        ) {
            return;
        }

        if (
                conteudo == null
                        || conteudo.isBlank()
        ) {
            return;
        }

        garantirHistoricoCarregado(
                conversationId
        );

        /*
         * Também garante que a memória persistida
         * seja carregada quando a conversa voltar
         * após um restart.
         */
        obterMemoria(
                conversationId
        );

        /*
         * Primeiro persiste a mensagem no H2.
         */
        persistenceService.salvarMensagem(
                conversationId,
                role,
                conteudo
        );

        /*
         * Depois atualiza a janela em RAM.
         */
        List<Mensagem> historico =
                conversas.computeIfAbsent(
                        conversationId,
                        id -> new ArrayList<>()
                );

        synchronized (historico) {

            historico.add(
                    new Mensagem(
                            role,
                            conteudo
                    )
            );

            limitarHistorico(
                    historico
            );
        }
    }


    /*
     * Carrega mensagens persistidas somente
     * quando a conversa ainda não está na RAM.
     */
    private void garantirHistoricoCarregado(
            String conversationId
    ) {

        if (
                conversationId == null
                        || conversationId.isBlank()
        ) {
            return;
        }

        if (conversas.containsKey(conversationId)) {
            return;
        }

        /*
         * Recupera todas as mensagens persistidas.
         */
        List<MessageEntity> mensagensPersistidas =
                persistenceService.buscarMensagens(
                        conversationId
                );

        /*
         * Recupera também a memória persistida.
         *
         * mensagensResumidas informa quantas mensagens
         * antigas já foram incorporadas ao resumo.
         */
        ConversationMemory memoria =
                obterMemoria(
                        conversationId
                );

        int mensagensJaResumidas =
                Math.max(
                        0,
                        memoria.getMensagensResumidas()
                );

        /*
         * Nunca avançamos além da quantidade
         * realmente existente no banco.
         */
        int inicioNaoResumido =
                Math.min(
                        mensagensJaResumidas,
                        mensagensPersistidas.size()
                );

        /*
         * Mesmo entre as mensagens ainda não resumidas,
         * mantemos no máximo LIMITE_MEMORIA em RAM.
         */
        int inicioJanela =
                Math.max(
                        inicioNaoResumido,
                        mensagensPersistidas.size()
                                - LIMITE_MEMORIA
                );

        List<Mensagem> historico =
                new ArrayList<>();

        for (
                int i = inicioJanela;
                i < mensagensPersistidas.size();
                i++
        ) {

            MessageEntity mensagem =
                    mensagensPersistidas.get(i);

            historico.add(
                    new Mensagem(
                            mensagem.getRole(),
                            mensagem.getContent()
                    )
            );
        }

        conversas.putIfAbsent(
                conversationId,
                historico
        );
    }


    private void persistirMemoria(
            String conversationId,
            ConversationMemory memoria
    ) {

        memoryPersistenceService.salvar(
                conversationId,
                memoria
        );
    }


    private void limitarHistorico(
            List<Mensagem> historico
    ) {

        while (
                historico.size()
                        > LIMITE_MEMORIA
        ) {

            historico.remove(0);
        }
    }


    private record Mensagem(
            String role,
            String conteudo
    ) {
    }

    public void atualizarCategoriaAtiva(
            String conversationId,
            String categoriaAtiva
    ) {

        ConversationMemory memoria =
                obterMemoria(conversationId);

        memoria.setCategoriaAtiva(
                categoriaAtiva
        );

        persistirMemoria(
                conversationId,
                memoria
        );
    }
}