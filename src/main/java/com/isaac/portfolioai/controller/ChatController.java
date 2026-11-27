package com.isaac.portfolioai.controller;

import com.isaac.portfolioai.dto.ChatRequest;
import com.isaac.portfolioai.dto.ChatResponse;
import com.isaac.portfolioai.service.ChatService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ChatController {

    private static final int MAX_CONVERSATION_ID_LENGTH = 100;

    private final ChatService chatService;
    private final int maxMessageLength;

    public ChatController(
            ChatService chatService,
            @Value("${app.chat.max-message-length}") int maxMessageLength
    ) {

        this.chatService =
                chatService;

        this.maxMessageLength =
                maxMessageLength;
    }


    /*
     * Usado pelo Render para saber se o serviço está no ar.
     */
    @GetMapping("/health")
    public String health() {
        return "ok";
    }


    @PostMapping("/chat")
    public ChatResponse chat(
            @RequestBody ChatRequest request
    ) {

        validar(request);

        return chatService.responder(
                request
        );
    }


    private void validar(
            ChatRequest request
    ) {

        String mensagem =
                request == null ? null : request.getMessage();

        if (mensagem == null || mensagem.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A pergunta não pode estar vazia."
            );
        }

        if (mensagem.length() > maxMessageLength) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A pergunta pode ter no máximo "
                            + maxMessageLength
                            + " caracteres."
            );
        }

        String conversationId =
                request.getConversationId();

        if (
                conversationId != null
                        && conversationId.length() > MAX_CONVERSATION_ID_LENGTH
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Identificador de conversa inválido."
            );
        }
    }
}
