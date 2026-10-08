package com.isaac.portfolioai.repository;

import com.isaac.portfolioai.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository
        extends JpaRepository<MessageEntity, Long> {

    List<MessageEntity> findByConversationIdOrderByCreatedAtAsc(
            String conversationId
    );
}