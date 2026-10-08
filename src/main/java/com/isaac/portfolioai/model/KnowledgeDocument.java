package com.isaac.portfolioai.model;

public class KnowledgeDocument {

    private final String categoria;
    private final String conteudo;

    public KnowledgeDocument(
            String categoria,
            String conteudo
    ) {
        this.categoria = categoria;
        this.conteudo = conteudo;
    }

    public String getCategoria() {
        return categoria;
    }

    public String getConteudo() {
        return conteudo;
    }
}