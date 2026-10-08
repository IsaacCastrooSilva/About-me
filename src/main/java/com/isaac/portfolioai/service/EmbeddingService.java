package com.isaac.portfolioai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    private static final String MODELO =
            "gemini-embedding-2";

    private static final int DIMENSOES =
            768;

    private final RestClient restClient;
    private final String apiKey;

    public EmbeddingService(
            @Value("${gemini.api.key}")
            String apiKey
    ) {

        this.apiKey = apiKey;

        this.restClient =
                RestClient.builder()
                        .baseUrl(
                                "https://generativelanguage.googleapis.com/v1beta"
                        )
                        .build();
    }

    public double[] gerarEmbedding(
            String texto
    ) {

        Map<String, Object> body =
                Map.of(
                        "content",
                        Map.of(
                                "parts",
                                List.of(
                                        Map.of(
                                                "text",
                                                texto
                                        )
                                )
                        ),
                        "outputDimensionality",
                        DIMENSOES
                );

        Map resposta =
                restClient
                        .post()
                        .uri(
                                "/models/"
                                        + MODELO
                                        + ":embedContent"
                        )
                        .header(
                                "x-goog-api-key",
                                apiKey
                        )
                        .header(
                                "Content-Type",
                                "application/json"
                        )
                        .body(body)
                        .retrieve()
                        .body(Map.class);

        if (resposta == null) {

            throw new RuntimeException(
                    "Embedding retornou resposta vazia."
            );
        }

        Map<String, Object> embedding =
                (Map<String, Object>)
                        resposta.get(
                                "embedding"
                        );

        if (embedding == null) {

            throw new RuntimeException(
                    "Resposta sem embedding."
            );
        }

        List<Number> values =
                (List<Number>)
                        embedding.get(
                                "values"
                        );

        if (
                values == null
                        || values.isEmpty()
        ) {

            throw new RuntimeException(
                    "Embedding sem valores."
            );
        }

        double[] vetor =
                new double[
                        values.size()
                        ];

        for (
                int i = 0;
                i < values.size();
                i++
        ) {

            vetor[i] =
                    values
                            .get(i)
                            .doubleValue();
        }

        return vetor;
    }
}