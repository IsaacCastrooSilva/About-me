package com.isaac.portfolioai.service;

import com.isaac.portfolioai.model.ConversationMemory;
import com.isaac.portfolioai.model.KnowledgeChunk;
import com.isaac.portfolioai.model.KnowledgeDocument;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class KnowledgeService {

    private final List<KnowledgeDocument> documentos =
            new ArrayList<>();

    private final List<KnowledgeChunk> chunks =
            new ArrayList<>();

    private final ChunkService chunkService;
    private final EmbeddingService embeddingService;
    private final EmbeddingCacheService embeddingCacheService;
    private final SemanticSearchService semanticSearchService;
    private final IntentService intentService;
    private final ConversationService conversationService;


    public KnowledgeService(
            ChunkService chunkService,
            EmbeddingService embeddingService,
            EmbeddingCacheService embeddingCacheService,
            SemanticSearchService semanticSearchService,
            IntentService intentService,
            ConversationService conversationService
    ) {

        this.chunkService =
                chunkService;

        this.embeddingService =
                embeddingService;

        this.embeddingCacheService =
                embeddingCacheService;

        this.semanticSearchService =
                semanticSearchService;

        this.intentService =
                intentService;

        this.conversationService =
                conversationService;


        carregarDocumento(
                "knowledge/perfil.txt",
                "PERFIL"
        );

        carregarDocumento(
                "knowledge/experiencia.txt",
                "EXPERIENCIA PROFISSIONAL"
        );

        carregarDocumento(
                "knowledge/formacao.txt",
                "FORMACAO ACADEMICA"
        );

        carregarDocumento(
                "knowledge/projetos.txt",
                "PROJETOS"
        );

        carregarDocumento(
                "knowledge/tecnologias.txt",
                "TECNOLOGIAS E COMPETENCIAS"
        );

        carregarDocumento(
                "knowledge/pessoal.txt",
                "PESSOAL"
        );

        carregarDocumento(
                "knowledge/hobbies.txt",
                "HOBBIES"
        );

        carregarDocumento(
                "knowledge/preferencias.txt",
                "PREFERENCIAS"
        );

        carregarDocumento(
                "knowledge/relacionamento.txt",
                "RELACIONAMENTO"
        );


        criarChunks();

        gerarEmbeddingsDosChunks();


        System.out.println();

        System.out.println(
                "=================================="
        );

        System.out.println(
                "BASE SEMANTICA CARREGADA"
        );

        System.out.println(
                "Documentos: "
                        + documentos.size()
        );

        System.out.println(
                "Chunks: "
                        + chunks.size()
        );

        System.out.println(
                "=================================="
        );
    }


    public String buscarConhecimento(
            String conversationId,
            String pergunta,
            String contextoConversacional
    ) {

        String consulta =
                pergunta;


        if (
                precisaDeContextoConversacional(
                        pergunta
                )
                        && possuiContexto(
                        contextoConversacional
                )
        ) {

            consulta =
                    criarConsultaContextual(
                            pergunta,
                            contextoConversacional
                    );


            System.out.println();

            System.out.println(
                    "BUSCA COM CONTEXTO CONVERSACIONAL"
            );


        } else {

            System.out.println();

            System.out.println(
                    "BUSCA COM PERGUNTA ATUAL"
            );
        }


        String categoriaDetectada =
                intentService
                        .identificarCategoria(
                                pergunta
                        );


        ConversationMemory memoria =
                conversationService
                        .obterMemoria(
                                conversationId
                        );


        String categoriaPrioritaria =
                resolverCategoria(
                        conversationId,
                        pergunta,
                        categoriaDetectada,
                        memoria
                );


        System.out.println(
                "Consulta RAG: "
                        + consulta
        );


        if (
                categoriaDetectada == null
        ) {

            System.out.println(
                    "Intencao atual: GERAL"
            );

        } else {

            System.out.println(
                    "Intencao atual: "
                            + categoriaDetectada
            );
        }


        if (
                categoriaPrioritaria == null
        ) {

            System.out.println(
                    "Categoria utilizada: nenhuma"
            );

        } else {

            System.out.println(
                    "Categoria utilizada: "
                            + categoriaPrioritaria
            );
        }


        List<KnowledgeChunk> selecionados =
                semanticSearchService
                        .buscar(
                                consulta,
                                chunks,
                                categoriaPrioritaria
                        );


        /*
         * O conteúdo recuperado pelo RAG é tratado
         * como evidência factual.
         *
         * Essas instruções ajudam a impedir que
         * o modelo complete informações ausentes
         * usando conhecimento geral ou inferências.
         */
        StringBuilder contexto =
                new StringBuilder();

        contexto.append(
                """
                
                [EVIDENCIA FACTUAL RECUPERADA]
                
                INSTRUCOES DE INTERPRETACAO:
                - O conteúdo abaixo é a evidência factual disponível sobre Isaac.
                - Afirme como fato somente informações explicitamente sustentadas por esta evidência.
                - Não complete informações ausentes usando conhecimento geral.
                - Não transforme características gerais de uma tecnologia em motivos pessoais de Isaac.
                - Não deduza decisões, preferências, intenções, planos futuros ou justificativas.
                - Se a pergunta pedir "por que", "motivo", "razão", "pretende", "planeja" ou informação futura e a resposta não estiver explicitamente nesta evidência, diga que essa informação não está definida ou não foi informada.
                - Experiência profissional com uma tecnologia não significa que ela pertence ou pertencerá a outro projeto.
                
                ESTILO DA RESPOSTA:
                - Nunca mencione "evidência", "evidência disponível", "base de conhecimento", "contexto recuperado", "RAG", "chunks" ou funcionamento interno da IA ao responder ao usuário.
                - Responda de forma natural, como alguém que conhece profissionalmente o Isaac.
                - Quando uma informação não estiver disponível, diga naturalmente que ela ainda não foi definida ou que o motivo específico não foi informado.
                - Não diga "a documentação que temos", "os dados disponíveis" ou expressões semelhantes.
                
                """
        );


        for (
                KnowledgeChunk chunk
                : selecionados
        ) {

            contexto.append(
                    "\n### "
            );

            contexto.append(
                    chunk.getCategoria()
            );

            contexto.append("\n");

            contexto.append(
                    chunk.getConteudo()
            );

            contexto.append("\n");
        }


        System.out.println();

        System.out.println(
                "Chunks enviados para IA: "
                        + selecionados.size()
        );

        System.out.println(
                "Contexto final: "
                        + contexto.length()
                        + " caracteres"
        );


        return contexto
                .toString();
    }


    private String resolverCategoria(
            String conversationId,
            String pergunta,
            String categoriaDetectada,
            ConversationMemory memoria
    ) {

        /*
         * Uma intenção explícita nova
         * tem prioridade.
         */
        if (
                categoriaDetectada != null
        ) {

            conversationService
                    .atualizarCategoriaAtiva(
                            conversationId,
                            categoriaDetectada
                    );


            return categoriaDetectada;
        }


        /*
         * Se a pergunta depende do contexto,
         * herdamos o tópico ativo.
         */
        if (
                intentService
                        .dependeDoContexto(
                                pergunta
                        )
                        && memoria
                        .possuiCategoriaAtiva()
        ) {

            System.out.println(
                    "Categoria herdada da conversa: "
                            + memoria
                            .getCategoriaAtiva()
            );


            return memoria
                    .getCategoriaAtiva();
        }


        return null;
    }


    private String criarConsultaContextual(
            String pergunta,
            String contextoConversacional
    ) {

        return """
                Contexto imediatamente anterior:
                %s

                Informação procurada agora:
                %s
                """.formatted(
                contextoConversacional,
                pergunta
        );
    }


    private boolean precisaDeContextoConversacional(
            String pergunta
    ) {

        if (
                pergunta == null
                        || pergunta.isBlank()
        ) {
            return false;
        }


        String texto =
                pergunta
                        .trim()
                        .toLowerCase();


        if (
                texto.length()
                        <= 45
        ) {
            return true;
        }


        return texto.contains(" ele ")
                || texto.startsWith("ele ")
                || texto.contains(" dele")
                || texto.contains(" isso")
                || texto.contains(" esse")
                || texto.contains(" essa")
                || texto.contains(" esses")
                || texto.contains(" essas")
                || texto.contains(" desse")
                || texto.contains(" dessa")
                || texto.contains(" disso")
                || texto.contains(" nisso")
                || texto.contains(" nele")
                || texto.contains(" nela")
                || texto.contains(" aquilo")
                || texto.contains(" aquele")
                || texto.contains(" aquela")
                || texto.contains(" lá")
                || texto.contains(" anterior")
                || texto.contains(" comentou")
                || texto.contains(" mencionou");
    }


    private boolean possuiContexto(
            String contexto
    ) {

        return contexto != null
                && !contexto.isBlank();
    }


    private void criarChunks() {

        chunks.clear();


        for (
                KnowledgeDocument documento
                : documentos
        ) {

            List<KnowledgeChunk> novosChunks =
                    chunkService
                            .criarChunks(
                                    documento
                                            .getCategoria(),
                                    documento
                                            .getConteudo()
                            );


            chunks.addAll(
                    novosChunks
            );
        }
    }


    /*
     * Carrega os embeddings dos chunks.
     *
     * Se o embedding já estiver no cache,
     * ele é reutilizado.
     *
     * Se não estiver, o Gemini gera um novo
     * embedding e o resultado é salvo.
     */
    private void gerarEmbeddingsDosChunks() {

        System.out.println();

        System.out.println(
                "CARREGANDO EMBEDDINGS..."
        );


        int reutilizados = 0;
        int gerados = 0;


        for (
                KnowledgeChunk chunk
                : chunks
        ) {

            String textoParaEmbedding =
                    "Categoria: "
                            + chunk.getCategoria()
                            + "\n"
                            + chunk.getConteudo();


            /*
             * Primeiro tentamos encontrar
             * o embedding no cache.
             */
            double[] embedding =
                    embeddingCacheService
                            .buscar(
                                    textoParaEmbedding
                            );


            /*
             * CACHE HIT
             */
            if (
                    embedding != null
            ) {

                chunk.setEmbedding(
                        embedding
                );


                reutilizados++;


                System.out.println(
                        "Embedding reutilizado do cache: "
                                + reutilizados
                );


                continue;
            }


            /*
             * CACHE MISS
             *
             * Só chamamos a API quando
             * o embedding ainda não existe.
             */
            embedding =
                    embeddingService
                            .gerarEmbedding(
                                    textoParaEmbedding
                            );


            chunk.setEmbedding(
                    embedding
            );


            embeddingCacheService
                    .salvar(
                            textoParaEmbedding,
                            embedding
                    );


            gerados++;


            System.out.println(
                    "Novo embedding gerado: "
                            + gerados
            );
        }


        System.out.println();

        System.out.println(
                "=================================="
        );

        System.out.println(
                "CACHE DE EMBEDDINGS"
        );

        System.out.println(
                "Reutilizados: "
                        + reutilizados
        );

        System.out.println(
                "Novos: "
                        + gerados
        );

        System.out.println(
                "Total de chunks: "
                        + chunks.size()
        );

        System.out.println(
                "Registros no cache: "
                        + embeddingCacheService
                        .quantidade()
        );

        System.out.println(
                "=================================="
        );
    }


    private void carregarDocumento(
            String caminho,
            String categoria
    ) {

        ClassPathResource resource =
                new ClassPathResource(
                        caminho
                );


        if (!resource.exists()) {

            throw new RuntimeException(
                    "Arquivo não encontrado: "
                            + caminho
            );
        }


        try (
                InputStream inputStream =
                        resource
                                .getInputStream()
        ) {

            String conteudo =
                    new String(
                            inputStream
                                    .readAllBytes(),
                            StandardCharsets.UTF_8
                    );


            documentos.add(
                    new KnowledgeDocument(
                            categoria,
                            conteudo
                    )
            );


            System.out.println(
                    "Arquivo carregado: "
                            + caminho
            );


        } catch (IOException e) {

            throw new RuntimeException(
                    "Erro ao carregar arquivo: "
                            + caminho,
                    e
            );
        }
    }
}