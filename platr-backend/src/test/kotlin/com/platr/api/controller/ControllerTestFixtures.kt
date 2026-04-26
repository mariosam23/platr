package com.platr.api.controller

import com.platr.api.dto.request.MealPlanDto
import com.platr.api.dto.request.MealPlanRecipeDto
import com.platr.api.dto.response.AuthResponse
import com.platr.api.dto.response.CategoryDto
import com.platr.api.dto.response.IngredientDto
import com.platr.api.dto.response.RecipeDetailDto
import com.platr.api.dto.response.RecipeIngredientDto
import com.platr.api.dto.response.RecipeSummaryDto
import com.platr.api.dto.response.ReviewResponse
import com.platr.api.enums.CategoryType
import com.platr.api.enums.MealType
import com.platr.api.enums.RecipeDifficulty
import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

object ControllerTestFixtures {
    fun authResponse() =
        AuthResponse(
            jwtToken = "access-token",
            refreshToken = "refresh-token",
        )

    fun categoryDto() =
        CategoryDto(
            categoryId = UUID.randomUUID(),
            categoryType = "ITALIAN",
        )

    fun ingredientDto() =
        IngredientDto(
            ingredientId = UUID.randomUUID(),
            name = "Tomato",
            unitHint = "g",
        )

    fun mealPlanDto() =
        MealPlanDto(
            mealPlanId = UUID.randomUUID(),
            weekStart = LocalDate.of(2026, 4, 20),
            notes = "Weekly meals",
            ownerId = UUID.randomUUID(),
            ownerUsername = "sam",
            recipes =
                listOf(
                    MealPlanRecipeDto(
                        mealPlanRecipeId = UUID.randomUUID(),
                        recipeId = UUID.randomUUID(),
                        recipeTitle = "Pasta",
                        mealType = MealType.DINNER,
                        dayOfWeek = DayOfWeek.MONDAY,
                    ),
                ),
            createdAt = Instant.parse("2026-04-20T00:00:00Z"),
            updatedAt = Instant.parse("2026-04-20T00:00:00Z"),
        )

    fun recipeSummaryDto() =
        RecipeSummaryDto(
            recipeId = UUID.randomUUID(),
            title = "Pasta",
            description = "Fresh pasta",
            prepTimeMinutes = 20,
            difficulty = RecipeDifficulty.MEDIUM,
            avgRating = 4.5,
            imageUrl = null,
            calories = 600,
            ownerId = UUID.randomUUID(),
            ownerUsername = "sam",
            categoryTypes = setOf(CategoryType.ITALIAN),
        )

    fun recipeDetailDto() =
        RecipeDetailDto(
            recipeId = UUID.randomUUID(),
            title = "Pasta",
            description = "Fresh pasta",
            prepTimeMinutes = 20,
            difficulty = RecipeDifficulty.MEDIUM,
            avgRating = 4.5,
            imageUrl = null,
            calories = 600,
            ownerId = UUID.randomUUID(),
            ownerUsername = "sam",
            ingredients =
                listOf(
                    RecipeIngredientDto(
                        ingredientId = UUID.randomUUID(),
                        ingredientName = "Tomato",
                        quantity = 2.0,
                        unit = "pcs",
                    ),
                ),
            reviews = listOf(reviewResponse()),
            categoryTypes = setOf(CategoryType.ITALIAN),
            createdAt = Instant.parse("2026-04-20T00:00:00Z"),
            updatedAt = Instant.parse("2026-04-20T00:00:00Z"),
        )

    fun reviewResponse() =
        ReviewResponse(
            reviewId = UUID.randomUUID(),
            rating = 5,
            text = "Excellent recipe",
            ownerId = UUID.randomUUID(),
            ownerUsername = "sam",
            createdAt = Instant.parse("2026-04-20T00:00:00Z"),
        )
}
