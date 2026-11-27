package com.isaac.portfolioai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    /*
     * Origens permitidas, separadas por vírgula.
     * Em produção, defina ALLOWED_ORIGINS com o domínio do
     * frontend, por exemplo: https://seusite.vercel.app
     */
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {

        String[] origens =
                Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .filter(origem -> !origem.isEmpty())
                        .toArray(String[]::new);

        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(
                    CorsRegistry registry
            ) {

                registry
                        .addMapping("/api/**")
                        .allowedOriginPatterns(origens)
                        .allowedMethods("POST", "OPTIONS")
                        .allowedHeaders("Content-Type");
            }
        };
    }
}
