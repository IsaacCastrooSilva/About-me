package com.isaac.portfolioai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_memory")
public class ConversationMemoryEntity {

    @Id
    @Column(
            name = "conversation_id",
            nullable = false,
            length = 100
    )
    private String conversationId;

    @Column(
            name = "resumo",
            columnDefinition = "TEXT"
    )
    private String resumo;

    @Column(
            name = "mensagens_resumidas",
            nullable = false
    )
    private int mensagensResumidas;

    @Column(
            name = "categoria_ativa",
            length = 100
    )
    private String categoriaAtiva;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;


    protected ConversationMemoryEntity() {
    }


    public ConversationMemoryEntity(
            String conversationId
    ) {

        this.conversationId =
                conversationId;

        this.resumo = "";

        this.mensagensResumidas = 0;

        this.updatedAt =
                LocalDateTime.now();
    }


    public void atualizar(
            String resumo,
            int mensagensResumidas,
            String categoriaAtiva
    ) {

        this.resumo =
                resumo == null
                        ? ""
                        : resumo;

        this.mensagensResumidas =
                mensagensResumidas;

        this.categoriaAtiva =
                categoriaAtiva;

        this.updatedAt =
                LocalDateTime.now();
    }


    public String getConversationId() {
        return conversationId;
    }


    public String getResumo() {
        return resumo;
    }


    public int getMensagensResumidas() {
        return mensagensResumidas;
    }


    public String getCategoriaAtiva() {
        return categoriaAtiva;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}