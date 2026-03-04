package com.platr.api.config.security

import com.platr.api.config.AuthenticatedUserPrincipal
import com.platr.api.repository.MealPlanRepository
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.util.UUID

@Component("mealPlanSecurity")
class MealPlanSecurity(
    private val mealPlanRepository: MealPlanRepository,
) {
    fun isOwner(
        authentication: Authentication,
        mealPlanId: UUID,
    ): Boolean {
        val principal = authentication.principal as? AuthenticatedUserPrincipal ?: return false
        return mealPlanRepository.existsByMealPlanIdAndOwnerUserId(mealPlanId, principal.id)
    }
}
