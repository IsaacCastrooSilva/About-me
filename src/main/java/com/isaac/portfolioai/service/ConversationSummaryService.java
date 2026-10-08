package com.isaac.portfolioai.service;

import com.isaac.portfolioai.model.ConversationMemory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConversationSummaryService {

    private static final int LIMITE_PARA_RESUMIR = 12;

    private final ConversationService conversationService;


    public ConversationSummaryService(
            ConversationService conversationService
    ) {

        this.conversationService =
                conversationService;
    }


    public boolean deveResumir(
            String conversationId
    ) {

        return conversationService
                .quantidadeMensagens(
                        conversationId
                )
                >= LIMITE_PARA_RESUMIR;
    }


    public void processarMemoria(
            String conversationId
    ) {

        if (
                !deveResumir(
                        conversationId
                )
        ) {
            return;
        }


        List<String> perguntasAntigas =
                conversationService
                        .obterPerguntasParaResumo(
                                conversationId
                        );


        if (perguntasAntigas.isEmpty()) {
            return;
        }


        ConversationMemory memoria =
                conversationService
                        .obterMemoria(
                                conversationId
                        );


        String novoResumo =
                criarResumoEstrutural(
                        memoria.getResumo(),
                        perguntasAntigas
                );


        int removidas =
                conversationService
                        .compactarHistorico(
                                conversationId
                        );


        int totalResumidas =
                memoria.getMensagensResumidas()
                        + removidas;


        conversationService
                .atualizarResumo(
                        conversationId,
                        novoResumo,
                        totalResumidas
                );


        System.out.println();
        System.out.println(
                "======================================"
        );

        System.out.println(
                "MEMORIA COMPACTADA"
        );

        System.out.println(
                "Conversa: "
                        + conversationId
        );

        System.out.println(
                "Mensagens compactadas agora: "
                        + removidas
        );

        System.out.println(
                "Total compactado: "
                        + totalResumidas
        );

        System.out.println(
                "Mensagens recentes mantidas: "
                        + conversationService
                        .quantidadeMensagens(
                                conversationId
                        )
        );

        System.out.println(
                "Resumo:"
        );

        System.out.println(
                novoResumo
        );

        System.out.println(
                "======================================"
        );
    }


    /*
     * Não usamos respostas anteriores da IA
     * para produzir esta memória.
     *
     * Guardamos apenas os assuntos/perguntas
     * trazidos pelo usuário.
     *
     * A knowledge base continua sendo
     * responsável pelos fatos sobre Isaac.
     */
    private String criarResumoEstrutural(
            String resumoAnterior,
            List<String> perguntas
    ) {

        StringBuilder resumo =
                new StringBuilder();


        if (
                resumoAnterior != null
                        && !resumoAnterior.isBlank()
        ) {

            resumo.append(
                    resumoAnterior.trim()
            );

            resumo.append("\n");
        }


        for (
                String pergunta
                : perguntas
        ) {

            String item =
                    normalizarPergunta(
                            pergunta
                    );


            if (
                    resumo
                            .toString()
                            .contains(item)
            ) {
                continue;
            }


            resumo.append(
                    "- O usuário perguntou: "
            );

            resumo.append(
                    item
            );

            resumo.append("\n");
        }


        return resumo
                .toString()
                .trim();
    }


    private String normalizarPergunta(
            String pergunta
    ) {

        if (pergunta == null) {
            return "";
        }


        return pergunta
                .trim()
                .replaceAll(
                        "\\s+",
                        " "
                );
    }
}