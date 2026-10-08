package com.isaac.portfolioai.service;

import com.isaac.portfolioai.model.ConversationMemory;
import com.isaac.portfolioai.repository.ConversationMemoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Import(ConversationMemoryPersistenceService.class)
class ConversationMemoryPersistenceServiceTest {

    @Autowired
    private ConversationMemoryPersistenceService persistenceService;

    @Autowired
    private ConversationMemoryRepository repository;


    @Test
    void deveSalvarERecuperarMemoriaDaConversa() {

        String conversationId =
                "memoria-" + UUID.randomUUID();

        ConversationMemory memoria =
                new ConversationMemory();

        memoria.setResumo(
                "O usuário estava conversando sobre o Portfolio AI."
        );

        memoria.setMensagensResumidas(12);

        memoria.setCategoriaAtiva(
                "PROJETOS"
        );


        persistenceService.salvar(
                conversationId,
                memoria
        );


        assertTrue(
                repository.existsById(conversationId)
        );


        Optional<ConversationMemory> resultado =
                persistenceService.buscar(
                        conversationId
                );


        assertTrue(resultado.isPresent());

        ConversationMemory memoriaRecuperada =
                resultado.get();


        assertEquals(
                "O usuário estava conversando sobre o Portfolio AI.",
                memoriaRecuperada.getResumo()
        );

        assertEquals(
                12,
                memoriaRecuperada.getMensagensResumidas()
        );

        assertEquals(
                "PROJETOS",
                memoriaRecuperada.getCategoriaAtiva()
        );
    }
}