package com.isaac.portfolioai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class MessageEntity {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            name = "conversation_id",
            nullable = false,
            length = 100
    )
    private String conversationId;

    @Column(
            name = "role",
            nullable = false,
            length = 20
    )
    private String role;

    @Column(
            name = "content",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String content;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;


    /*
     * Construtor obrigatório para o JPA.
     */
    protected MessageEntity() {
    }


    /*
     * Cria uma nova mensagem.
     */
    public MessageEntity(
            String conversationId,
            String role,
            String content
    ) {

        this.conversationId =
                conversationId;

        this.role =
                role;

        this.content =
                content;

        this.createdAt =
                LocalDateTime.now();
    }


    public Long getId() {

        return id;
    }


    public String getConversationId() {

        return conversationId;
    }


    public String getRole() {

        return role;
    }


    public String getContent() {

        return content;
    }


    public LocalDateTime getCreatedAt() {

        return createdAt;
    }
}