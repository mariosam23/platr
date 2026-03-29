package com.platr.api.service

import com.platr.api.dto.request.MealPlanDto
import com.platr.api.dto.request.MealPlanRequest
import com.platr.api.dto.toMealPlanDto
import com.platr.api.entity.MealPlan
import com.platr.api.entity.MealPlanRecipe
import com.platr.api.entity.User
import com.platr.api.exception.DuplicateMealPlanAssignmentException
import com.platr.api.exception.MealPlanNotFoundException
import com.platr.api.exception.RecipeNotFoundException
import com.platr.api.exception.UserNotFoundException
import com.platr.api.repository.MealPlanRecipeRepository
import com.platr.api.repository.MealPlanRepository
import com.platr.api.repository.RecipeRepository
import com.platr.api.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class MealPlanService(
    private val mealPlanRepository: MealPlanRepository,
    private val mealPlanRecipeRepository: MealPlanRecipeRepository,
    private val recipeRepository: RecipeRepository,
    private val userRepository: UserRepository,
) {
    companion object {
        private val logger = LoggerFactory.getLogger(MealPlanService::class.java)
    }

    @Transactional(readOnly = true)
    fun getUserMealPlans(
        userEmail: String,
        pageable: Pageable,
    ): Page<MealPlanDto> {
        val user = findUserByEmailOrThrow(userEmail)
        return mealPlanRepository
            .findByOwnerUserId(user.userId!!, pageable)
            .map { it.toMealPlanDto() }
    }

    @Transactional(readOnly = true)
    fun getMealPlanById(
        planId: UUID,
        userEmail: String,
    ): MealPlanDto {
        findUserByEmailOrThrow(userEmail)
        val mealPlan =
            mealPlanRepository
                .findById(planId)
                .orElseThrow { MealPlanNotFoundException("Meal plan not found with id: $planId") }
        return mealPlan.toMealPlanDto()
    }

    @Transactional
    fun createMealPlan(
        request: MealPlanRequest,
        userEmail: String,
    ): MealPlanDto {
        val user = findUserByEmailOrThrow(userEmail)
        validateUniqueAssignments(request)

        val mealPlan =
            MealPlan(
                weekStart = request.weekStart,
                notes = request.notes,
                owner = user,
                mealPlanRecipes = mutableListOf(),
            )

        val mealPlanRecipes = toMealPlanRecipes(mealPlan, request)
        mealPlan.mealPlanRecipes.addAll(mealPlanRecipes)

        val savedMealPlan = mealPlanRepository.save(mealPlan)
        logger.info("Created meal plan with ID: ${savedMealPlan.mealPlanId} for user: ${user.username}")
        return savedMealPlan.toMealPlanDto()
    }

    @Transactional
    fun updateMealPlan(
        planId: UUID,
        request: MealPlanRequest,
        userEmail: String,
    ): MealPlanDto {
        findUserByEmailOrThrow(userEmail)
        validateUniqueAssignments(request)

        val mealPlan =
            mealPlanRepository
                .findById(planId)
                .orElseThrow { MealPlanNotFoundException("Meal plan not found with id: $planId") }

        mealPlan.weekStart = request.weekStart
        mealPlan.notes = request.notes

        mealPlan.mealPlanRecipes.clear()
        mealPlanRecipeRepository.flush()
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

    private fun validateUniqueAssignments(request: MealPlanRequest) {
        val duplicateAssignment =
            request.assignments
                .groupBy { it.mealType to it.dayOfWeek }
                .entries
                .firstOrNull { (_, assignments) -> assignments.size > 1 }

        if (duplicateAssignment != null) {
            val (mealType, dayOfWeek) = duplicateAssignment.key
            throw DuplicateMealPlanAssignmentException(
                "Duplicate assignment for $mealType on $dayOfWeek is not allowed",
            )
        }
    }

    private fun toMealPlanRecipes(
        mealPlan: MealPlan,
        request: MealPlanRequest,
    ): List<MealPlanRecipe> {
        fun findRecipeOrThrow(recipeId: UUID) =
            recipeRepository
                .findById(recipeId)
                .orElseThrow { RecipeNotFoundException("Recipe not found with id: $recipeId") }

        return request.assignments.map { assignment ->
            val recipe = findRecipeOrThrow(assignment.recipeId)
            MealPlanRecipe(
                mealPlan = mealPlan,
                recipe = recipe,
                dayOfWeek = assignment.dayOfWeek,
                mealType = assignment.mealType,
            )
        }
    }

    private fun findUserByEmailOrThrow(userEmail: String): User =
        userRepository.findUserByEmail(userEmail)
            ?: throw UserNotFoundException("User not found with email: $userEmail")
}
