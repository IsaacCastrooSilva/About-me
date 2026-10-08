package com.isaac.portfolioai.service;

import com.isaac.portfolioai.entity.MessageEntity;
import com.isaac.portfolioai.repository.ConversationRepository;
import com.isaac.portfolioai.repository.MessageRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@Import(ConversationPersistenceService.class)
class ConversationPersistenceServiceTest {

    @Autowired
    private ConversationPersistenceService persistenceService;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Test
    void deveSalvarConversaEMensagens() {

        String conversationId =
                "teste-" + UUID.randomUUID();

        persistenceService.salvarMensagem(
                conversationId,
                "user",
                "Quem é o Isaac?"
        );

        persistenceService.salvarMensagem(
                conversationId,
                "assistant",
                "Isaac é desenvolvedor de software."
        );

        assertTrue(
                conversationRepository.existsById(conversationId)
        );

        List<MessageEntity> mensagens =
                persistenceService.buscarMensagens(conversationId);

        assertEquals(2, mensagens.size());

        assertEquals(
                "user",
                mensagens.get(0).getRole()
        );

        assertEquals(
                "Quem é o Isaac?",
                mensagens.get(0).getContent()
        );

        assertEquals(
                "assistant",
                mensagens.get(1).getRole()
        );

        assertEquals(
                "Isaac é desenvolvedor de software.",
                mensagens.get(1).getContent()
        );
    }
}