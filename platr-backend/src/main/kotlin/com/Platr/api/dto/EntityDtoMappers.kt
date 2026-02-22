package com.Platr.api.dto

import com.Platr.api.entity.MealPlan
import com.Platr.api.entity.MealPlanRecipe
import com.Platr.api.entity.Recipe
import com.Platr.api.entity.RecipeIngredient
import com.Platr.api.entity.Review
import com.Platr.api.entity.User
import com.Platr.api.enums.Role
import org.springframework.security.crypto.password.PasswordEncoder

fun Recipe.toRecipeSummaryDto() = RecipeSummaryDto(
    recipeId = recipeId,
    title = title,
    description = description,
    prepTimeMinutes = prepTimeMinutes,
    difficulty = difficulty,
    avgRating = avgRating,
    imageUrl = imageUrl,
    calories = calories,
    ownerId = owner.userId,
    ownerUsername = owner.username,
    categoryTypes = categories.map { it.category.categoryType }.toSet(),
)

fun Recipe.toRecipeDetailDto() = RecipeDetailDto(
    recipeId = recipeId,
    title = title,
    description = description,
    prepTimeMinutes = prepTimeMinutes,
    difficulty = difficulty,
    avgRating = avgRating,
    imageUrl = imageUrl,
    calories = calories,
    ownerId = owner.userId,
    ownerUsername = owner.username,
    ingredients = ingredients.map { it.toRecipeIngredientDto() },
    reviews = reviews.map { it.toReviewResponse() },
    categoryTypes = categories.map { it.category.categoryType }.toSet(),
    createdAt = createdAt,
    updatedAt = updatedAt,
)

fun RegisterRequest.toUser(passwordEncoder: PasswordEncoder) = User(
    username = this.username,
    email = this.email,
    hashedPassword = passwordEncoder.encode(this.password) ?: throw IllegalStateException("Failed to encode password"),
    displayedName = this.displayedName,
    roles = setOf(Role.USER),
)

fun MealPlan.toMealPlanDto() = MealPlanDto(
    mealPlanId = mealPlanId,
    weekStart = weekStart,
    notes = notes,
    ownerId = owner.userId,
    ownerUsername = owner.username,
    recipes = mealPlanRecipes.map { it.toMealPlanRecipeDto() },
    createdAt = createdAt,
    updatedAt = updatedAt,
)

fun RecipeIngredient.toRecipeIngredientDto() = RecipeIngredientDto(
    ingredientId = ingredient.ingredientId,
    ingredientName = ingredient.name,
    quantity = quantity,
    unit = unit,
)

fun Review.toReviewResponse() = ReviewResponse(
    reviewId = reviewId,
    rating = rating,
    text = text,
    ownerId = owner.userId,
    ownerUsername = owner.username,
    createdAt = createdAt,
)

private fun MealPlanRecipe.toMealPlanRecipeDto() = MealPlanRecipeDto(
    mealPlanRecipeId = mealPlanRecipeId,
    recipeId = recipe.recipeId,
    recipeTitle = recipe.title,
    mealType = mealType,
    dayOfWeek = dayOfWeek,
)