package com.isaac.portfolioai.service;

import com.isaac.portfolioai.dto.ChatRequest;
import com.isaac.portfolioai.dto.ChatResponse;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ChatService {

    private final AIService aiService;

    public ChatService(
            AIService aiService
    ) {

        this.aiService =
                aiService;
    }


    public ChatResponse responder(
            ChatRequest request
    ) {

        String conversationId =
                request.getConversationId();


        /*
         * Se for a primeira mensagem,
         * criamos uma nova conversa.
         */
        if (
                conversationId == null
                        || conversationId.isBlank()
        ) {

            conversationId =
                    UUID.randomUUID()
                            .toString();
        }


        String resposta =
                aiService.perguntar(
                        conversationId,
                        request.getMessage()
                );


        return new ChatResponse(
                resposta,
                conversationId
        );
    }
}