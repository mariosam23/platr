package com.Platr.api.config.security

import com.Platr.api.config.AuthenticatedUserPrincipal
import com.Platr.api.repository.RecipeRepository
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.util.UUID

@Component("recipeSecurity")
class RecipeSecurity(
    private val recipeRepository: RecipeRepository,
) {
    fun isOwner(authentication: Authentication, recipeId: UUID): Boolean {
        val principal = authentication.principal as? AuthenticatedUserPrincipal ?: return false
        return recipeRepository.existsByRecipeIdAndOwnerUserId(recipeId, principal.id)
    }
}