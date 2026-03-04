package com.platr.api.dto

import com.platr.api.enums.MealType
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.DayOfWeek
import java.time.LocalDate
import java.util.UUID

data class MealPlanRequest(
    @field:NotNull(message = "Week start is required")
    var weekStart: LocalDate,
    @field:NotBlank(message = "Notes are required")
    @field:Size(max = 1000, message = "Notes must be at most 1000 chars")
    val notes: String,
    @field:NotEmpty(message = "At least one recipe assignment is required")
    @field:Valid
    val assignments: List<MealPlanRecipeAssignmentRequest>,
)

data class MealPlanRecipeAssignmentRequest(
    @field:NotNull(message = "Recipe id is required")
    var recipeId: UUID,
    @field:NotNull(message = "Meal type is required")
    var mealType: MealType,
    @field:NotNull(message = "Day of week is required")
    var dayOfWeek: DayOfWeek,
)
