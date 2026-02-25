package com.Platr.api.config.security

import com.Platr.api.config.AuthenticatedUserPrincipal
import com.Platr.api.repository.ReviewRepository
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.util.UUID

@Component("reviewSecurity")
class ReviewSecurity(
    private val reviewRepository: ReviewRepository
) {
    fun isOwner(authentication: Authentication, reviewId: UUID): Boolean {
        val principal = authentication.principal as? AuthenticatedUserPrincipal ?: return false
        return reviewRepository.existsByReviewIdAndOwnerUserId(reviewId, principal.id)
    }
}
