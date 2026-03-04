package com.platr.api.dto

import com.platr.api.enums.MealType
import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

data class MealPlanDto(
    val mealPlanId: UUID?,
    val weekStart: LocalDate,
    val notes: String,
    val ownerId: UUID?,
    val ownerUsername: String,
    val recipes: List<MealPlanRecipeDto>,
    val createdAt: Instant,
    val updatedAt: Instant,
)

data class MealPlanRecipeDto(
    val mealPlanRecipeId: UUID?,
    val recipeId: UUID?,
    val recipeTitle: String,
    val mealType: MealType,
    val dayOfWeek: DayOfWeek,
)
