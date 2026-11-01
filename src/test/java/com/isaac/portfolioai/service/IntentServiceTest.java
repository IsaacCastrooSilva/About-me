package com.isaac.portfolioai.service;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

class IntentServiceTest {
    private final IntentService service = new IntentService();

    @ParameterizedTest
    @ValueSource(strings = {
            "Como posso entrar em contato com o Isaac?",
            "Qual é o e-mail do Isaac?",
            "Qual o telefone dele?",
            "E o número?",
            "Contato para conversar sobre projetos e trabalho",
            "Como falar com o Isaac?"
    })
    void reconheceContatoMesmoComOutroAssunto(String pergunta) {
        assertEquals("CONTATO", service.identificarCategoria(pergunta));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Quais projetos o Isaac desenvolveu?", "Como funciona o Theodor AI?"})
    void preservaCategoriaDeProjetos(String pergunta) {
        assertEquals("PROJETOS", service.identificarCategoria(pergunta));
    }
}
