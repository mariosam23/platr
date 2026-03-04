package com.platr.api.dto

import com.platr.api.enums.RecipeDifficulty
import jakarta.validation.Valid
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.util.UUID

data class RecipeRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 50, message = "Title must be at most 50 chars")
    val title: String,
    @field:NotBlank(message = "Description is required")
    @field:Size(max = 500, message = "Description must be at most 500 chars")
    val description: String,
    @field:Min(value = 1, message = "Prep time must be at least 1 minute")
    val prepTimeMinutes: Int,
    @field:NotNull(message = "Difficulty is required")
    var difficulty: RecipeDifficulty,
    val imageUrl: String? = null,
    val calories: Int? = null,
    @field:NotEmpty(message = "At least one ingredient is required")
    @field:Valid
    val ingredients: MutableList<RecipeIngredientRequest>,
    val categoryIds: Set<UUID> = emptySet(),
)

data class RecipeIngredientRequest(
    @field:NotNull(message = "Ingredient id is required")
    var ingredientId: UUID,
    @field:DecimalMin(value = "0.000001", message = "Ingredient quantity must be positive")
    val quantity: Double,
    @field:Size(max = 20, message = "Unit must be at most 20 chars")
    val unit: String? = null,
)
