package com.isaac.portfolioai.dto;

public class ChatRequest {

    private String message;

    private String conversationId;

    public String getMessage() {
        return message;
    }

    public void setMessage(
            String message
    ) {
        this.message = message;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(
            String conversationId
    ) {
        this.conversationId =
                conversationId;
    }
}