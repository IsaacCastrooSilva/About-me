package com.isaac.portfolioai.service;

import com.isaac.portfolioai.entity.ConversationMemoryEntity;
import com.isaac.portfolioai.model.ConversationMemory;
import com.isaac.portfolioai.repository.ConversationMemoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ConversationMemoryPersistenceService {

    private final ConversationMemoryRepository repository;


    public ConversationMemoryPersistenceService(
            ConversationMemoryRepository repository
    ) {
        this.repository = repository;
    }


    @Transactional
    public void salvar(
            String conversationId,
            ConversationMemory memoria
    ) {

        if (
                conversationId == null
                        || conversationId.isBlank()
                        || memoria == null
        ) {
            return;
        }

        ConversationMemoryEntity entity =
                repository.findById(conversationId)
                        .orElseGet(
                                () -> new ConversationMemoryEntity(
                                        conversationId
                                )
                        );

        entity.atualizar(
                memoria.getResumo(),
                memoria.getMensagensResumidas(),
                memoria.getCategoriaAtiva()
        );

        repository.save(entity);
    }


    @Transactional(readOnly = true)
    public Optional<ConversationMemory> buscar(
            String conversationId
    ) {

        if (
                conversationId == null
                        || conversationId.isBlank()
        ) {
            return Optional.empty();
        }

        return repository
                .findById(conversationId)
                .map(this::converter);
    }


    private ConversationMemory converter(
            ConversationMemoryEntity entity
    ) {

        ConversationMemory memoria =
                new ConversationMemory();

        memoria.setResumo(
                entity.getResumo()
        );

        memoria.setMensagensResumidas(
                entity.getMensagensResumidas()
        );

        memoria.setCategoriaAtiva(
                entity.getCategoriaAtiva()
        );

        return memoria;
    }
}