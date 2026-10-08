package com.isaac.portfolioai.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingCacheService {

    private static final Path CACHE_PATH =
            Path.of(
                    "data",
                    "embeddings.cache"
            );

    private final Map<String, double[]> cache =
            new HashMap<>();


    public EmbeddingCacheService() {

        carregar();
    }


    public double[] buscar(
            String conteudo
    ) {

        if (
                conteudo == null
                        || conteudo.isBlank()
        ) {
            return null;
        }

        return cache.get(
                gerarHash(conteudo)
        );
    }


    public void salvar(
            String conteudo,
            double[] embedding
    ) {

        if (
                conteudo == null
                        || conteudo.isBlank()
                        || embedding == null
                        || embedding.length == 0
        ) {
            return;
        }


        String hash =
                gerarHash(
                        conteudo
                );


        cache.put(
                hash,
                embedding
        );


        persistir();
    }


    public boolean possui(
            String conteudo
    ) {

        if (
                conteudo == null
                        || conteudo.isBlank()
        ) {
            return false;
        }


        return cache.containsKey(
                gerarHash(conteudo)
        );
    }


    public int quantidade() {

        return cache.size();
    }


    private void carregar() {

        if (
                !Files.exists(
                        CACHE_PATH
                )
        ) {

            System.out.println(
                    "Cache de embeddings ainda nao existe."
            );

            return;
        }


        try {

            List<String> linhas =
                    Files.readAllLines(
                            CACHE_PATH,
                            StandardCharsets.UTF_8
                    );


            for (
                    String linha
                    : linhas
            ) {

                if (
                        linha == null
                                || linha.isBlank()
                ) {
                    continue;
                }


                carregarLinha(
                        linha
                );
            }


            System.out.println(
                    "Cache de embeddings carregado: "
                            + cache.size()
                            + " registros."
            );


        } catch (IOException e) {

            throw new RuntimeException(
                    "Erro ao carregar cache de embeddings.",
                    e
            );
        }
    }


    private void carregarLinha(
            String linha
    ) {

        int separador =
                linha.indexOf('|');


        if (
                separador <= 0
                        || separador
                        == linha.length() - 1
        ) {
            return;
        }


        String hash =
                linha.substring(
                        0,
                        separador
                );


        String embeddingBase64 =
                linha.substring(
                        separador + 1
                );


        try {

            byte[] bytes =
                    Base64
                            .getDecoder()
                            .decode(
                                    embeddingBase64
                            );


            String valores =
                    new String(
                            bytes,
                            StandardCharsets.UTF_8
                    );


            String[] partes =
                    valores.split(",");


            double[] embedding =
                    new double[
                            partes.length
                            ];


            for (
                    int i = 0;
                    i < partes.length;
                    i++
            ) {

                embedding[i] =
                        Double.parseDouble(
                                partes[i]
                        );
            }


            cache.put(
                    hash,
                    embedding
            );


        } catch (Exception e) {

            System.out.println(
                    "Registro invalido ignorado no cache."
            );
        }
    }


    private void persistir() {

        try {

            Path diretorio =
                    CACHE_PATH
                            .getParent();


            if (diretorio != null) {

                Files.createDirectories(
                        diretorio
                );
            }


            StringBuilder arquivo =
                    new StringBuilder();


            for (
                    Map.Entry<String, double[]> entry
                    : cache.entrySet()
            ) {

                arquivo.append(
                        entry.getKey()
                );


                arquivo.append('|');


                StringBuilder valores =
                        new StringBuilder();


                double[] embedding =
                        entry.getValue();


                for (
                        int i = 0;
                        i < embedding.length;
                        i++
                ) {

                    if (i > 0) {

                        valores.append(',');
                    }


                    valores.append(
                            embedding[i]
                    );
                }


                String base64 =
                        Base64
                                .getEncoder()
                                .encodeToString(
                                        valores
                                                .toString()
                                                .getBytes(
                                                        StandardCharsets.UTF_8
                                                )
                                );


                arquivo.append(
                        base64
                );


                arquivo.append(
                        System.lineSeparator()
                );
            }


            Files.writeString(
                    CACHE_PATH,
                    arquivo.toString(),
                    StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING
            );


        } catch (IOException e) {

            throw new RuntimeException(
                    "Erro ao salvar cache de embeddings.",
                    e
            );
        }
    }


    private String gerarHash(
            String conteudo
    ) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );


            byte[] hash =
                    digest.digest(
                            conteudo.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );


            return Base64
                    .getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(
                            hash
                    );


        } catch (NoSuchAlgorithmException e) {

            throw new IllegalStateException(
                    "SHA-256 nao esta disponivel.",
                    e
            );
        }
    }
}