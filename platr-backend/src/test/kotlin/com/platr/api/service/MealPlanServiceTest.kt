package com.platr.api.service

import com.platr.api.dto.request.MealPlanRecipeAssignmentRequest
import com.platr.api.dto.request.MealPlanRequest
import com.platr.api.entity.MealPlan
import com.platr.api.entity.MealPlanRecipe
import com.platr.api.entity.Recipe
import com.platr.api.entity.User
import com.platr.api.enums.MealType
import com.platr.api.enums.RecipeDifficulty
import com.platr.api.enums.Role
import com.platr.api.exception.DuplicateMealPlanAssignmentException
import com.platr.api.repository.MealPlanRecipeRepository
import com.platr.api.repository.MealPlanRepository
import com.platr.api.repository.RecipeRepository
import com.platr.api.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import java.time.DayOfWeek
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

class MealPlanServiceTest {
    private val mealPlanRepository = mock(MealPlanRepository::class.java)
    private val mealPlanRecipeRepository = mock(MealPlanRecipeRepository::class.java)
    private val recipeRepository = mock(RecipeRepository::class.java)
    private val userRepository = mock(UserRepository::class.java)

    private val service =
        MealPlanService(
            mealPlanRepository = mealPlanRepository,
            mealPlanRecipeRepository = mealPlanRecipeRepository,
            recipeRepository = recipeRepository,
            userRepository = userRepository,
        )

    @Test
    fun `updateMealPlan flushes removed assignments before saving replacements`() {
        val owner = user()
        val originalRecipe = recipe(owner, "Original")
        val replacementRecipe = recipe(owner, "Replacement")
        val mealPlan =
            MealPlan(
                mealPlanId = UUID.randomUUID(),
                weekStart = LocalDate.of(2026, 3, 23),
                notes = "Initial notes",
                owner = owner,
                mealPlanRecipes = mutableListOf(),
            )

        mealPlan.mealPlanRecipes +=
            MealPlanRecipe(
                mealPlanRecipeId = UUID.randomUUID(),
                mealPlan = mealPlan,
                recipe = originalRecipe,
                mealType = MealType.BREAKFAST,
                dayOfWeek = DayOfWeek.MONDAY,
            )

        val request =
            MealPlanRequest(
                weekStart = LocalDate.of(2026, 3, 30),
                notes = "Updated notes",
                assignments =
                    listOf(
                        MealPlanRecipeAssignmentRequest(
                            recipeId = replacementRecipe.recipeId!!,
                            mealType = MealType.BREAKFAST,
                            dayOfWeek = DayOfWeek.MONDAY,
                        ),
                    ),
            )

        `when`(userRepository.findUserByEmail(owner.email)).thenReturn(owner)
        `when`(mealPlanRepository.findById(mealPlan.mealPlanId!!)).thenReturn(Optional.of(mealPlan))
        `when`(recipeRepository.findById(replacementRecipe.recipeId!!)).thenReturn(Optional.of(replacementRecipe))
        `when`(mealPlanRepository.save(any(MealPlan::class.java))).thenAnswer { invocation -> invocation.getArgument(0) }

        val result = service.updateMealPlan(mealPlan.mealPlanId!!, request, owner.email)

        verify(mealPlanRecipeRepository).flush()
        verify(mealPlanRepository).save(mealPlan)
        assertEquals(request.weekStart, mealPlan.weekStart)
        assertEquals(request.notes, mealPlan.notes)
        assertEquals(1, mealPlan.mealPlanRecipes.size)
        assertSame(replacementRecipe, mealPlan.mealPlanRecipes.single().recipe)
        assertEquals(MealType.BREAKFAST, mealPlan.mealPlanRecipes.single().mealType)
        assertEquals(DayOfWeek.MONDAY, mealPlan.mealPlanRecipes.single().dayOfWeek)
        assertEquals(mealPlan.mealPlanId, result.mealPlanId)
    }

    @Test
    fun `createMealPlan rejects duplicate meal type and day assignments`() {
        val owner = user()
        val firstRecipe = recipe(owner, "First")
        val secondRecipe = recipe(owner, "Second")
        val request =
            MealPlanRequest(
                weekStart = LocalDate.of(2026, 3, 30),
                notes = "Updated notes",
                assignments =
                    listOf(
                        MealPlanRecipeAssignmentRequest(
                            recipeId = firstRecipe.recipeId!!,
                            mealType = MealType.BREAKFAST,
                            dayOfWeek = DayOfWeek.MONDAY,
                        ),
                        MealPlanRecipeAssignmentRequest(
                            recipeId = secondRecipe.recipeId!!,
                            mealType = MealType.BREAKFAST,
                            dayOfWeek = DayOfWeek.MONDAY,
                        ),
                    ),
            )

        `when`(userRepository.findUserByEmail(owner.email)).thenReturn(owner)

        val error =
            assertThrows(DuplicateMealPlanAssignmentException::class.java) {
                service.createMealPlan(request, owner.email)
            }

        assertEquals("Duplicate assignment for BREAKFAST on MONDAY is not allowed", error.message)
        verify(recipeRepository, never()).findById(any(UUID::class.java))
        verify(mealPlanRepository, never()).save(any(MealPlan::class.java))
    }

    private fun user() =
        User(
            userId = UUID.randomUUID(),
            username = "mario1",
            email = "mario1@mario.com",
            hashedPassword = "hashed-password",
            roles = setOf(Role.USER),
        )

    private fun recipe(
        owner: User,
        title: String,
    ) = Recipe(
        recipeId = UUID.randomUUID(),
        title = title,
        description = "$title description",
        prepTimeMinutes = 15,
        difficulty = RecipeDifficulty.EASY,
        avgRating = 0.0,
        imageUrl = null,
        calories = 250,
        owner = owner,
    )
}
