package com.Platr.api.dto

import com.Platr.api.entity.Recipe
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
) {
    companion object {
        fun fromEntity(recipe: Recipe): RecipeSummaryDto {
            return RecipeSummaryDto(
                recipeId = recipe.recipeId,
                title = recipe.title,
                description = recipe.description,
                prepTimeMinutes = recipe.prepTimeMinutes,
                difficulty = recipe.difficulty,
                avgRating = recipe.avgRating,
                imageUrl = recipe.imageUrl,
                calories = recipe.calories,
                ownerId = recipe.owner.userId,
                ownerUsername = recipe.owner.username,
                categoryTypes = recipe.categories.map { it.category.categoryType }.toSet()
            )
        }
    }
}

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
