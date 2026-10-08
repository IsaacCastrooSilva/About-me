package com.isaac.portfolioai.service;

import com.isaac.portfolioai.model.KnowledgeChunk;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SemanticSearchService {

    private static final int MAX_CHUNKS = 5;

    private static final double SCORE_MINIMO = 0.65;
    private static final double MARGEM_MAXIMA = 0.08;
    private static final double QUEDA_RELEVANTE = 0.045;

    /*
     * Pequeno bônus aplicado quando o chunk
     * pertence à categoria identificada.
     *
     * A categoria influencia o ranking,
     * mas não bloqueia outras categorias.
     */
    private static final double BONUS_CATEGORIA = 0.035;


    private final EmbeddingService embeddingService;


    public SemanticSearchService(
            EmbeddingService embeddingService
    ) {

        this.embeddingService =
                embeddingService;
    }


    public List<KnowledgeChunk> buscar(
            String pergunta,
            List<KnowledgeChunk> chunks
    ) {

        return buscar(
                pergunta,
                chunks,
                null
        );
    }


    public List<KnowledgeChunk> buscar(
            String pergunta,
            List<KnowledgeChunk> chunks,
            String categoriaPrioritaria
    ) {

        double[] embeddingPergunta =
                embeddingService
                        .gerarEmbedding(
                                pergunta
                        );


        List<Resultado> resultados =
                new ArrayList<>();


        for (
                KnowledgeChunk chunk
                : chunks
        ) {

            if (
                    chunk.getEmbedding()
                            == null
            ) {
                continue;
            }


            double similaridadeOriginal =
                    similaridadeCosseno(
                            embeddingPergunta,
                            chunk.getEmbedding()
                    );


            double bonus =
                    calcularBonusCategoria(
                            chunk,
                            categoriaPrioritaria
                    );


            double scoreFinal =
                    similaridadeOriginal
                            + bonus;


            resultados.add(
                    new Resultado(
                            chunk,
                            similaridadeOriginal,
                            scoreFinal
                    )
            );
        }


        resultados.sort(
                Comparator
                        .comparingDouble(
                                Resultado::scoreFinal
                        )
                        .reversed()
        );


        if (resultados.isEmpty()) {
            return new ArrayList<>();
        }


        imprimirRanking(
                resultados,
                categoriaPrioritaria
        );


        List<KnowledgeChunk> selecionados =
                selecionarChunks(
                        resultados
                );


        System.out.println();

        System.out.println(
                "Chunks selecionados: "
                        + selecionados.size()
        );

        System.out.println(
                "Melhor score final: "
                        + String.format(
                        "%.4f",
                        resultados
                                .get(0)
                                .scoreFinal()
                )
        );

        System.out.println(
                "=================================="
        );


        return selecionados;
    }


    private double calcularBonusCategoria(
            KnowledgeChunk chunk,
            String categoriaPrioritaria
    ) {

        if (
                categoriaPrioritaria == null
                        || categoriaPrioritaria.isBlank()
        ) {
            return 0;
        }


        if (
                categoriaPrioritaria.equalsIgnoreCase(
                        chunk.getCategoria()
                )
        ) {
            return BONUS_CATEGORIA;
        }


        return 0;
    }


    private List<KnowledgeChunk> selecionarChunks(
            List<Resultado> resultados
    ) {

        List<KnowledgeChunk> selecionados =
                new ArrayList<>();


        if (resultados.isEmpty()) {
            return selecionados;
        }


        Resultado melhorResultado =
                resultados.get(0);


        double melhorScore =
                melhorResultado.scoreFinal();


        /*
         * Se nem o melhor resultado atingir
         * o score mínimo, não enviamos
         * conhecimento pouco confiável ao modelo.
         */
        if (
                melhorScore
                        < SCORE_MINIMO
        ) {

            System.out.println(
                    "Nenhum chunk selecionado: "
                            + "melhor resultado abaixo do score mínimo."
            );

            return selecionados;
        }


        /*
         * O melhor resultado entra primeiro.
         */
        selecionados.add(
                melhorResultado.chunk()
        );


        /*
         * A partir do segundo resultado,
         * todos precisam provar relevância.
         */
        for (
                int i = 1;
                i < resultados.size();
                i++
        ) {

            if (
                    selecionados.size()
                            >= MAX_CHUNKS
            ) {
                break;
            }


            Resultado atual =
                    resultados.get(i);


            double scoreAtual =
                    atual.scoreFinal();


            /*
             * Não aceita resultados abaixo
             * do mínimo de relevância.
             */
            if (
                    scoreAtual
                            < SCORE_MINIMO
            ) {

                System.out.println(
                        "Parada Top-K: "
                                + "score abaixo do mínimo."
                );

                break;
            }


            /*
             * Evita incluir chunks muito distantes
             * semanticamente do melhor resultado.
             */
            double distanciaDoMelhor =
                    melhorScore
                            - scoreAtual;


            if (
                    distanciaDoMelhor
                            > MARGEM_MAXIMA
            ) {

                System.out.println(
                        "Parada Top-K: "
                                + "resultado distante do melhor."
                );

                break;
            }


            /*
             * Verifica se houve uma queda grande
             * entre dois resultados consecutivos.
             */
            double scoreAnterior =
                    resultados
                            .get(i - 1)
                            .scoreFinal();


            double queda =
                    scoreAnterior
                            - scoreAtual;


            if (
                    queda
                            > QUEDA_RELEVANTE
            ) {

                System.out.println(
                        "Parada Top-K: "
                                + "queda relevante entre resultados."
                );

                break;
            }


            selecionados.add(
                    atual.chunk()
            );
        }


        return selecionados;
    }


    private void imprimirRanking(
            List<Resultado> resultados,
            String categoriaPrioritaria
    ) {

        System.out.println();

        System.out.println(
                "=================================="
        );

        System.out.println(
                "RESULTADOS SEMANTICOS"
        );


        if (
                categoriaPrioritaria != null
                        && !categoriaPrioritaria.isBlank()
        ) {

            System.out.println(
                    "Categoria prioritaria: "
                            + categoriaPrioritaria
            );

        } else {

            System.out.println(
                    "Categoria prioritaria: nenhuma"
            );
        }


        int quantidadeParaLog =
                Math.min(
                        8,
                        resultados.size()
                );


        for (
                int i = 0;
                i < quantidadeParaLog;
                i++
        ) {

            Resultado resultado =
                    resultados.get(i);


            System.out.printf(
                    "%d. %s | semântico: %.4f | final: %.4f%n",
                    i + 1,
                    resultado
                            .chunk()
                            .getCategoria(),
                    resultado
                            .similaridadeOriginal(),
                    resultado
                            .scoreFinal()
            );
        }
    }


    private double similaridadeCosseno(
            double[] vetorA,
            double[] vetorB
    ) {

        if (
                vetorA.length
                        != vetorB.length
        ) {

            throw new IllegalArgumentException(
                    "Embeddings possuem dimensões diferentes."
            );
        }


        double produto = 0;
        double normaA = 0;
        double normaB = 0;


        for (
                int i = 0;
                i < vetorA.length;
                i++
        ) {

            produto +=
                    vetorA[i]
                            * vetorB[i];


            normaA +=
                    vetorA[i]
                            * vetorA[i];


            normaB +=
                    vetorB[i]
                            * vetorB[i];
        }


        if (
                normaA == 0
                        || normaB == 0
        ) {
            return 0;
        }


        return produto
                / (
                Math.sqrt(normaA)
                        * Math.sqrt(normaB)
        );
    }


    private record Resultado(
            KnowledgeChunk chunk,
            double similaridadeOriginal,
            double scoreFinal
    ) {
    }
}