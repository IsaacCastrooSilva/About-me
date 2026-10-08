package com.isaac.portfolioai.repository;

import com.isaac.portfolioai.entity.ConversationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationRepository
        extends JpaRepository<ConversationEntity, String> {
}