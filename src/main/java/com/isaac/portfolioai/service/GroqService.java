package com.isaac.portfolioai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    private final RestClient restClient;
    private final String apiKey;

    public GroqService(
            @Value("${groq.api.key}") String apiKey
    ) {
        this.apiKey = apiKey;

        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
    }

    public String perguntar(String prompt) {

        System.out.println("Usando GROQ como fallback...");

        Map<String, Object> body = Map.of(
                "model", "openai/gpt-oss-120b",
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                )
        );

        Map resposta = restClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(Map.class);

        if (resposta == null) {
            throw new RuntimeException(
                    "Groq retornou uma resposta vazia."
            );
        }

        List<Map<String, Object>> choices =
                (List<Map<String, Object>>) resposta.get("choices");

        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException(
                    "Groq não retornou nenhuma resposta."
            );
        }

        Map<String, Object> choice = choices.get(0);

        Map<String, Object> message =
                (Map<String, Object>) choice.get("message");

        if (message == null) {
            throw new RuntimeException(
                    "Resposta da Groq sem campo message."
            );
        }

        String content = (String) message.get("content");

        if (content == null || content.isBlank()) {
            throw new RuntimeException(
                    "Groq retornou conteúdo vazio."
            );
        }

        System.out.println("GROQ respondeu com sucesso!");

        return content;
    }
}