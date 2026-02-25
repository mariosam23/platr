package com.Platr.api.service

import com.Platr.api.dto.MealPlanDto
import com.Platr.api.dto.MealPlanRequest
import com.Platr.api.dto.toMealPlanDto
import com.Platr.api.entity.MealPlan
import com.Platr.api.entity.MealPlanRecipe
import com.Platr.api.entity.User
import com.Platr.api.exception.MealPlanNotFoundException
import com.Platr.api.exception.RecipeNotFoundException
import com.Platr.api.exception.UserNotFoundException
import com.Platr.api.repository.MealPlanRepository
import com.Platr.api.repository.RecipeRepository
import com.Platr.api.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class MealPlanService(
    private val mealPlanRepository: MealPlanRepository,
    private val recipeRepository: RecipeRepository,
    private val userRepository: UserRepository
) {
    companion object {
        private val logger = LoggerFactory.getLogger(MealPlanService::class.java)
    }

    @Transactional(readOnly = true)
    fun getUserMealPlans(userEmail: String, pageable: Pageable): Page<MealPlanDto> {
        val user = findUserByEmailOrThrow(userEmail)
        return mealPlanRepository.findByOwnerUserId(user.userId!!, pageable)
            .map { it.toMealPlanDto() }
    }

    @Transactional(readOnly = true)
    fun getMealPlanById(planId: UUID, userEmail: String): MealPlanDto {
        findUserByEmailOrThrow(userEmail)
        val mealPlan = mealPlanRepository.findById(planId)
            .orElseThrow { MealPlanNotFoundException("Meal plan not found with id: $planId") }
        return mealPlan.toMealPlanDto()
    }

    @Transactional
    fun createMealPlan(request: MealPlanRequest, userEmail: String): MealPlanDto {
        val user = findUserByEmailOrThrow(userEmail)

        val mealPlan = MealPlan(
            weekStart = request.weekStart,
            notes = request.notes,
            owner = user,
            mealPlanRecipes = mutableListOf()
        )

        val mealPlanRecipes = toMealPlanRecipes(mealPlan, request)
        mealPlan.mealPlanRecipes.addAll(mealPlanRecipes)

        val savedMealPlan = mealPlanRepository.save(mealPlan)
        logger.info("Created meal plan with ID: ${savedMealPlan.mealPlanId} for user: ${user.username}")
        return savedMealPlan.toMealPlanDto()
    }

    @Transactional
    fun updateMealPlan(planId: UUID, request: MealPlanRequest, userEmail: String): MealPlanDto {
        findUserByEmailOrThrow(userEmail)

        val mealPlan = mealPlanRepository.findById(planId)
            .orElseThrow { MealPlanNotFoundException("Meal plan not found with id: $planId") }

        mealPlan.weekStart = request.weekStart
        mealPlan.notes = request.notes

        mealPlan.mealPlanRecipes.clear()
        val mealPlanRecipes = toMealPlanRecipes(mealPlan, request)
        mealPlan.mealPlanRecipes.addAll(mealPlanRecipes)

        val updatedMealPlan = mealPlanRepository.save(mealPlan)
        logger.info("Updated meal plan with ID: ${updatedMealPlan.mealPlanId} for user: $userEmail")
        return updatedMealPlan.toMealPlanDto()
    }

    @Transactional
    fun deleteMealPlan(planId: UUID) {
        if (!mealPlanRepository.existsById(planId)) {
            throw MealPlanNotFoundException("Meal plan not found with id: $planId")
        }

        mealPlanRepository.deleteById(planId)
        logger.info("Deleted meal plan with ID: $planId")
    }

    private fun toMealPlanRecipes(mealPlan: MealPlan, request: MealPlanRequest): List<MealPlanRecipe> {
        fun findRecipeOrThrow(recipeId: UUID) =
            recipeRepository.findById(recipeId)
                .orElseThrow { RecipeNotFoundException("Recipe not found with id: $recipeId") }

        return request.assignments.map { assignment ->
            val recipe = findRecipeOrThrow(assignment.recipeId)
            MealPlanRecipe(
                mealPlan = mealPlan,
                recipe = recipe,
                dayOfWeek = assignment.dayOfWeek,
                mealType = assignment.mealType
            )
        }
    }

    private fun findUserByEmailOrThrow(userEmail: String): User {
        return userRepository.findUserByEmail(userEmail)
            ?: throw UserNotFoundException("User not found with email: $userEmail")
    }
}