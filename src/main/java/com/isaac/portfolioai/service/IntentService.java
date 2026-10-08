package com.isaac.portfolioai.service;

import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Service
public class IntentService {

    public String identificarCategoria(String pergunta) {
        if (pergunta == null || pergunta.isBlank()) {
            return null;
        }

        String texto = normalizar(pergunta);
        Set<String> palavras = new HashSet<>(
                Arrays.asList(texto.split("[^a-z0-9]+"))
        );

        // A primeira categoria encontrada tem prioridade.
        if (temPalavra(palavras, "projeto", "projetos")
                || temTrecho(texto, "portfolio ai", "portfolioai",
                "portfolio ia", "cube ai", "cube ia")) {
            return "PROJETOS";
        }

        if (temPalavra(palavras, "trabalho", "trabalha", "empresa",
                "emprego", "cargo")
                || temTrecho(texto, "experiencia profissional",
                "profissionalmente")) {
            return "EXPERIENCIA PROFISSIONAL";
        }

        if (temPalavra(palavras, "faculdade", "formacao", "graduacao",
                "curso", "cursos", "formado", "formada")
                || temTrecho(texto, "unip", "fiap", "dio", "formado em")) {
            return "FORMACAO ACADEMICA";
        }

        if (temPalavra(palavras, "namorada", "namoro",
                "relacionamento", "mariana")
                || temTrecho(texto, "desde quando namora", "futura esposa")) {
            return "RELACIONAMENTO";
        }

        if (temPalavra(palavras, "hobby", "hobbies", "guitarra",
                "guitarrista", "guitarristas", "musica", "musicas",
                "banda", "bandas", "metallica", "academia",
                "corrida", "warzone")
                || temTrecho(texto, "call of duty", "tempo livre")) {
            return "HOBBIES";
        }

        if (temPalavra(palavras, "comida", "comidas", "bebida",
                "bebidas", "filme", "filmes", "lugar", "lugares",
                "frio", "corinthians")
                || temTrecho(texto, "gosta de comer", "gosta de beber",
                "comida favorita", "bebida favorita")) {
            return "PREFERENCIAS";
        }

        if (temPalavra(palavras, "personalidade", "curiosidade",
                "curiosidades", "leticia", "elvis")
                || temTrecho(texto, "como ele se descreve",
                "como isaac se descreve", "vida pessoal",
                "animal de estimacao")) {
            return "PESSOAL";
        }

        if (temPalavra(palavras, "tecnologia", "tecnologias",
                "linguagem", "linguagens", "stack", "java",
                "coldfusion", "sql", "python", "react", "javascript",
                "git", "github", "rag", "embedding", "embeddings", "llm")
                || temTrecho(texto, "spring boot", "inteligencia artificial")) {
            return "TECNOLOGIAS E COMPETENCIAS";
        }

        if (temPalavra(palavras, "idade", "anos", "nasceu", "nascimento")
                || temTrecho(texto, "quem e isaac", "quem e o isaac",
                "quem e ele", "sobre isaac", "fale sobre isaac",
                "apresente isaac", "quantos anos")) {
            return "PERFIL";
        }

        return null;
    }

    public boolean dependeDoContexto(String pergunta) {
        if (pergunta == null || pergunta.isBlank()) {
            return false;
        }

        String texto = normalizar(pergunta);

        return temTrecho(texto, "esse ", "essa ", "isso", "nele",
                "nela", "dele", "dela", "aquele", "aquela")
                || texto.startsWith("ele ")
                || texto.startsWith("ela ")
                || texto.startsWith("e ")
                || texto.length() <= 25;
    }

    private boolean temPalavra(Set<String> palavras, String... termos) {
        return Arrays.stream(termos).anyMatch(palavras::contains);
    }

    private boolean temTrecho(String texto, String... trechos) {
        return Arrays.stream(trechos).anyMatch(texto::contains);
    }

    private String normalizar(String texto) {
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }
}