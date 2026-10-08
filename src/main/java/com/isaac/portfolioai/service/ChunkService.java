package com.isaac.portfolioai.service;

import com.isaac.portfolioai.model.KnowledgeChunk;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChunkService {

    private static final int TAMANHO_MAXIMO_CHUNK = 700;

    public List<KnowledgeChunk> criarChunks(
            String categoria,
            String conteudo
    ) {

        List<KnowledgeChunk> chunks =
                new ArrayList<>();

        if (conteudo == null || conteudo.isBlank()) {
            return chunks;
        }

        String conteudoNormalizado =
                conteudo.replace("\r\n", "\n");

        String[] blocos =
                conteudoNormalizado.split("\\n\\s*\\n");

        String tituloContexto = "";
        StringBuilder chunkAtual =
                new StringBuilder();

        for (String bloco : blocos) {

            String texto = bloco.trim();

            if (texto.isBlank()) {
                continue;
            }

            /*
             * Detecta títulos/seções.
             *
             * Exemplos:
             * PORTFOLIO AI
             * CANTINA ESCOLAR
             * Backend:
             * Persistência:
             * MEMÓRIA CONVERSACIONAL:
             */
            if (ehTitulo(texto)) {

                if (!chunkAtual.isEmpty()) {

                    adicionarChunk(
                            chunks,
                            categoria,
                            tituloContexto,
                            chunkAtual.toString()
                    );

                    chunkAtual.setLength(0);
                }

                tituloContexto = texto;

                continue;
            }

            int tamanhoContexto =
                    tituloContexto.length();

            boolean ultrapassaLimite =
                    tamanhoContexto
                            + chunkAtual.length()
                            + texto.length()
                            > TAMANHO_MAXIMO_CHUNK;

            if (
                    ultrapassaLimite
                            && !chunkAtual.isEmpty()
            ) {

                adicionarChunk(
                        chunks,
                        categoria,
                        tituloContexto,
                        chunkAtual.toString()
                );

                chunkAtual.setLength(0);
            }

            if (!chunkAtual.isEmpty()) {
                chunkAtual.append("\n\n");
            }

            chunkAtual.append(texto);
        }

        if (!chunkAtual.isEmpty()) {

            adicionarChunk(
                    chunks,
                    categoria,
                    tituloContexto,
                    chunkAtual.toString()
            );
        }

        return chunks;
    }

    private boolean ehTitulo(String texto) {

        if (texto == null || texto.isBlank()) {
            return false;
        }

        /*
         * Títulos não devem possuir várias linhas.
         */
        if (texto.contains("\n")) {
            return false;
        }

        /*
         * Evita classificar parágrafos grandes
         * como títulos.
         */
        if (texto.length() > 100) {
            return false;
        }

        /*
         * Títulos terminados em ":".
         *
         * Exemplo:
         * Backend:
         * Persistência:
         */
        if (texto.endsWith(":")) {
            return true;
        }

        /*
         * Títulos escritos totalmente
         * em letras maiúsculas.
         *
         * Exemplo:
         * PORTFOLIO AI
         * CANTINA ESCOLAR
         * RODAR
         */
        return texto.equals(
                texto.toUpperCase()
        );
    }

    private void adicionarChunk(
            List<KnowledgeChunk> chunks,
            String categoria,
            String tituloContexto,
            String conteudo
    ) {

        StringBuilder conteudoFinal =
                new StringBuilder();

        if (
                tituloContexto != null
                        && !tituloContexto.isBlank()
        ) {

            conteudoFinal
                    .append("SEÇÃO: ")
                    .append(tituloContexto.trim())
                    .append("\n\n");
        }

        conteudoFinal.append(
                conteudo.trim()
        );

        chunks.add(
                new KnowledgeChunk(
                        categoria,
                        conteudoFinal.toString()
                )
        );
    }
}