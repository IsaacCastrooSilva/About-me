package com.isaac.portfolioai.service;

import com.isaac.portfolioai.entity.ConversationEntity;
import com.isaac.portfolioai.entity.MessageEntity;
import com.isaac.portfolioai.repository.ConversationRepository;
import com.isaac.portfolioai.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConversationPersistenceService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public ConversationPersistenceService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public ConversationEntity obterOuCriarConversa(
            String conversationId
    ) {
        return conversationRepository
                .findById(conversationId)
                .orElseGet(() ->
                        conversationRepository.save(
                                new ConversationEntity(conversationId)
                        )
                );
    }

    @Transactional
    public void salvarMensagem(
            String conversationId,
            String role,
            String content
    ) {

        ConversationEntity conversa =
                obterOuCriarConversa(conversationId);

        MessageEntity mensagem =
                new MessageEntity(
                        conversationId,
                        role,
                        content
                );

        messageRepository.save(mensagem);

        conversa.atualizar();

        conversationRepository.save(conversa);
    }

    @Transactional(readOnly = true)
    public List<MessageEntity> buscarMensagens(
            String conversationId
    ) {
        return messageRepository
                .findByConversationIdOrderByCreatedAtAsc(
                        conversationId
                );
    }
}