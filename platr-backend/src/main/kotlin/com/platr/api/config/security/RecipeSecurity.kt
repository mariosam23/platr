package com.platr.api.config.security

import com.platr.api.config.AuthenticatedUserPrincipal
import com.platr.api.repository.RecipeRepository
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.util.UUID

@Component("recipeSecurity")
class RecipeSecurity(
    private val recipeRepository: RecipeRepository,
) {
    fun isOwner(
        authentication: Authentication,
        recipeId: UUID,
    ): Boolean {
        val principal = authentication.principal as? AuthenticatedUserPrincipal ?: return false
        return recipeRepository.existsByRecipeIdAndOwnerUserId(recipeId, principal.id)
    }
}
