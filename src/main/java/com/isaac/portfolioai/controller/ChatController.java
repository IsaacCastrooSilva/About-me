package com.isaac.portfolioai.controller;

import com.isaac.portfolioai.dto.ChatRequest;
import com.isaac.portfolioai.dto.ChatResponse;
import com.isaac.portfolioai.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ChatService chatService;

    public ChatController(
            ChatService chatService
    ) {

        this.chatService =
                chatService;
    }


    @PostMapping("/chat")
    public ChatResponse chat(
            @RequestBody ChatRequest request
    ) {

        return chatService.responder(
                request
        );
    }
}