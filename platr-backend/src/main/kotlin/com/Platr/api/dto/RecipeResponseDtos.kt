package com.Platr.api.dto

import com.Platr.api.enums.CategoryType
import com.Platr.api.enums.RecipeDifficulty
import java.time.Instant
import java.util.UUID

data class RecipeSummaryDto(
    val recipeId: UUID?,
    val title: String,
    val description: String,
    val prepTimeMinutes: Int,
    val difficulty: RecipeDifficulty,
    val avgRating: Double,
    val imageUrl: String?,
    val calories: Int?,
    val ownerId: UUID?,
    val ownerUsername: String,
    val categoryTypes: Set<CategoryType>,
)

data class RecipeDetailDto(
    val recipeId: UUID?,
    val title: String,
    val description: String,
    val prepTimeMinutes: Int,
    val difficulty: RecipeDifficulty,
    val avgRating: Double,
    val imageUrl: String?,
    val calories: Int?,
    val ownerId: UUID?,
    val ownerUsername: String,
    val ingredients: List<RecipeIngredientDto>,
    val reviews: List<ReviewResponse>,
    val categoryTypes: Set<CategoryType>,
    val createdAt: Instant,
    val updatedAt: Instant,
)

data class RecipeIngredientDto(
    val ingredientId: UUID?,
    val ingredientName: String,
    val quantity: Double,
    val unit: String?,
)
