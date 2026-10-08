package com.isaac.portfolioai.model;

public class ConversationMemory {

    private String resumo = "";

    private int mensagensResumidas = 0;

    /*
     * Categoria do assunto atualmente
     * discutido na conversa.
     *
     * Exemplos:
     *
     * PROJETOS
     * EXPERIENCIA PROFISSIONAL
     * FORMACAO ACADEMICA
     * TECNOLOGIAS E COMPETENCIAS
     * PERFIL
     */
    private String categoriaAtiva;


    public String getResumo() {
        return resumo;
    }


    public void setResumo(
            String resumo
    ) {

        this.resumo =
                resumo == null
                        ? ""
                        : resumo;
    }


    public int getMensagensResumidas() {
        return mensagensResumidas;
    }


    public void setMensagensResumidas(
            int mensagensResumidas
    ) {

        this.mensagensResumidas =
                mensagensResumidas;
    }


    public String getCategoriaAtiva() {
        return categoriaAtiva;
    }


    public void setCategoriaAtiva(
            String categoriaAtiva
    ) {

        this.categoriaAtiva =
                categoriaAtiva;
    }


    public boolean possuiResumo() {

        return resumo != null
                && !resumo.isBlank();
    }


    public boolean possuiCategoriaAtiva() {

        return categoriaAtiva != null
                && !categoriaAtiva.isBlank();
    }
}