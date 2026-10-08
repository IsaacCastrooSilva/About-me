package com.isaac.portfolioai.model;

public class KnowledgeChunk {

    private final String categoria;
    private final String conteudo;
    private double[] embedding;

    public KnowledgeChunk(
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

    public double[] getEmbedding() {
        return embedding;
    }

    public void setEmbedding(
            double[] embedding
    ) {
        this.embedding = embedding;
    }
}