package com.isaac.portfolioai.dto;

public class ChatResponse {

    private String answer;

    private String conversationId;

    public ChatResponse(
            String answer,
            String conversationId
    ) {

        this.answer = answer;

        this.conversationId =
                conversationId;
    }

    public String getAnswer() {
        return answer;
    }

    public String getConversationId() {
        return conversationId;
    }
}