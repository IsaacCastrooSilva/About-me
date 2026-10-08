package com.isaac.portfolioai.repository;

import com.isaac.portfolioai.entity.ConversationMemoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationMemoryRepository
        extends JpaRepository<ConversationMemoryEntity, String> {
}