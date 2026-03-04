package com.platr.api.repository

import com.platr.api.entity.Review
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ReviewRepository : JpaRepository<Review, UUID> {
    fun existsByReviewIdAndOwnerUserId(
        reviewId: UUID,
        ownerUserId: UUID,
    ): Boolean

    fun existsByRecipeRecipeIdAndOwnerUserId(
        recipeId: UUID,
        ownerUserId: UUID,
    ): Boolean

    fun findByRecipeRecipeId(
        recipeId: UUID,
        pageable: Pageable,
    ): Page<Review>
}
