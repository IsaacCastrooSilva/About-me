package com.isaac.portfolioai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
public class ConversationEntity {

    @Id
    @Column(
            name = "id",
            nullable = false,
            length = 100
    )
    private String id;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;


    /*
     * Construtor obrigatório para o JPA.
     */
    protected ConversationEntity() {
    }


    /*
     * Cria uma nova conversa.
     */
    public ConversationEntity(
            String id
    ) {

        this.id = id;

        this.createdAt =
                LocalDateTime.now();

        this.updatedAt =
                LocalDateTime.now();
    }


    /*
     * Atualiza a data da última atividade
     * da conversa.
     */
    public void atualizar() {

        this.updatedAt =
                LocalDateTime.now();
    }


    public String getId() {

        return id;
    }


    public LocalDateTime getCreatedAt() {

        return createdAt;
    }


    public LocalDateTime getUpdatedAt() {

        return updatedAt;
    }
}