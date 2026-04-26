package com.platr.api.service

import com.platr.api.dto.request.MealPlanRecipeAssignmentRequest
import com.platr.api.dto.request.MealPlanRequest
import com.platr.api.enums.MealType
import com.platr.api.exception.DuplicateMealPlanAssignmentException
import com.platr.api.repository.MealPlanRecipeRepository
import com.platr.api.repository.MealPlanRepository
import com.platr.api.repository.RecipeRepository
import com.platr.api.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import java.time.DayOfWeek
import java.time.LocalDate
import java.util.Optional

class MealPlanServiceTest {
    private val mealPlanRepository: MealPlanRepository = Mockito.mock(MealPlanRepository::class.java)
    private val mealPlanRecipeRepository: MealPlanRecipeRepository = Mockito.mock(MealPlanRecipeRepository::class.java)
    private val recipeRepository: RecipeRepository = Mockito.mock(RecipeRepository::class.java)
    private val userRepository: UserRepository = Mockito.mock(UserRepository::class.java)

    private val mealPlanService =
        MealPlanService(
            mealPlanRepository = mealPlanRepository,
            mealPlanRecipeRepository = mealPlanRecipeRepository,
            recipeRepository = recipeRepository,
            userRepository = userRepository,
        )

    @Test
    fun `createMealPlan rejects duplicate day and meal type assignments`() {
        val owner = ServiceTestFixtures.user(email = "sam@example.com")
        val recipeId = java.util.UUID.randomUUID()
        val request =
            MealPlanRequest(
                weekStart = LocalDate.of(2026, 4, 20),
                notes = "Weekly plan",
                assignments =
                    listOf(
                        MealPlanRecipeAssignmentRequest(recipeId, MealType.DINNER, DayOfWeek.MONDAY),
                        MealPlanRecipeAssignmentRequest(recipeId, MealType.DINNER, DayOfWeek.MONDAY),
                    ),
            )
        Mockito.`when`(userRepository.findUserByEmail(owner.email)).thenReturn(owner)

        assertThrows(DuplicateMealPlanAssignmentException::class.java) {
            mealPlanService.createMealPlan(request, owner.email)
        }
    }

    @Test
    fun `createMealPlan maps assignments and returns DTO`() {
        val owner = ServiceTestFixtures.user()
        val recipe = ServiceTestFixtures.recipe(owner = owner, title = "Pasta")
        val request =
            MealPlanRequest(
                weekStart = LocalDate.of(2026, 4, 20),
                notes = "Weekly plan",
                assignments =
                    listOf(
                        MealPlanRecipeAssignmentRequest(recipe.recipeId!!, MealType.DINNER, DayOfWeek.MONDAY),
                    ),
            )

        Mockito.`when`(userRepository.findUserByEmail(owner.email)).thenReturn(owner)
        Mockito.`when`(recipeRepository.findById(recipe.recipeId!!)).thenReturn(Optional.of(recipe))
        Mockito.`when`(mealPlanRepository.save(Mockito.any(com.platr.api.entity.MealPlan::class.java))).thenAnswer { invocation ->
            invocation.arguments[0] as com.platr.api.entity.MealPlan
        }

        val result = mealPlanService.createMealPlan(request, owner.email)

        assertEquals(owner.userId, result.ownerId)
        assertEquals("Pasta", result.recipes.single().recipeTitle)
        assertEquals(MealType.DINNER, result.recipes.single().mealType)
    }
}
