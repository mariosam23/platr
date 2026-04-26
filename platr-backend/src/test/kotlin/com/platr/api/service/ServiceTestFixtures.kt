package com.platr.api.service

import com.platr.api.config.AuthenticatedUserPrincipal
import com.platr.api.entity.Category
import com.platr.api.entity.Ingredient
import com.platr.api.entity.MealPlan
import com.platr.api.entity.Recipe
import com.platr.api.entity.Review
import com.platr.api.entity.User
import com.platr.api.enums.CategoryType
import com.platr.api.enums.RecipeDifficulty
import com.platr.api.enums.Role
import org.springframework.security.core.authority.SimpleGrantedAuthority
import java.time.LocalDate
import java.util.UUID

object ServiceTestFixtures {
    fun user(
        id: UUID = UUID.randomUUID(),
        username: String = "sam",
        email: String = "sam@example.com",
        roles: Set<Role> = setOf(Role.USER),
    ) = User(
        userId = id,
        username = username,
        email = email,
        hashedPassword = "hashed-password",
        roles = roles,
    )

    fun principal(user: User) =
        AuthenticatedUserPrincipal(
            id = user.userId!!,
            displayUsername = user.username,
            email = user.email,
            passwordHash = user.hashedPassword,
            grantedAuthorities = user.roles.map { SimpleGrantedAuthority("ROLE_${it.name}") },
        )

    fun category(
        id: UUID = UUID.randomUUID(),
        type: CategoryType = CategoryType.ITALIAN,
    ) = Category(
        categoryId = id,
        categoryType = type,
    )

    fun ingredient(
        id: UUID = UUID.randomUUID(),
        name: String = "Tomato",
        unitHint: String? = "g",
    ) = Ingredient(
        ingredientId = id,
        name = name,
        unitHint = unitHint,
    )

    fun recipe(
        owner: User,
        id: UUID = UUID.randomUUID(),
        title: String = "Pasta",
        avgRating: Double = 0.0,
    ) = Recipe(
        recipeId = id,
        title = title,
        description = "Simple pasta",
        prepTimeMinutes = 20,
        difficulty = RecipeDifficulty.EASY,
        avgRating = avgRating,
        imageUrl = null,
        calories = 500,
        owner = owner,
    )

    fun review(
        owner: User,
        recipe: Recipe,
        id: UUID = UUID.randomUUID(),
        rating: Int = 4,
        text: String = "Very good",
    ) = Review(
        reviewId = id,
        rating = rating,
        text = text,
        owner = owner,
        recipe = recipe,
    )

    fun mealPlan(
        owner: User,
        id: UUID = UUID.randomUUID(),
    ) = MealPlan(
        mealPlanId = id,
        weekStart = LocalDate.of(2026, 4, 20),
        notes = "Weekly meals",
        owner = owner,
    )
}
