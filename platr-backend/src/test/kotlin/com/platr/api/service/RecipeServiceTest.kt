package com.platr.api.service

import com.platr.api.dto.request.RecipeIngredientRequest
import com.platr.api.dto.request.RecipeRequest
import com.platr.api.dto.request.ReviewRequest
import com.platr.api.enums.CategoryType
import com.platr.api.enums.RecipeDifficulty
import com.platr.api.repository.CategoryRepository
import com.platr.api.repository.IngredientRepository
import com.platr.api.repository.RecipeRepository
import com.platr.api.repository.ReviewRepository
import com.platr.api.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

class RecipeServiceTest {
    private val recipeRepository: RecipeRepository = Mockito.mock(RecipeRepository::class.java)
    private val ingredientRepository: IngredientRepository = Mockito.mock(IngredientRepository::class.java)
    private val categoryRepository: CategoryRepository = Mockito.mock(CategoryRepository::class.java)
    private val userRepository: UserRepository = Mockito.mock(UserRepository::class.java)
    private val reviewRepository: ReviewRepository = Mockito.mock(ReviewRepository::class.java)

    private val recipeService =
        RecipeService(
            recipeRepository = recipeRepository,
            ingredientRepository = ingredientRepository,
            categoryRepository = categoryRepository,
            userRepository = userRepository,
            reviewRepository = reviewRepository,
        )

    @Test
    fun `createRecipe builds ingredient and category relationships`() {
        val owner = ServiceTestFixtures.user()
        val ingredient = ServiceTestFixtures.ingredient(name = "Tomato")
        val category = ServiceTestFixtures.category(type = CategoryType.ITALIAN)
        val request =
            RecipeRequest(
                title = "Pasta",
                description = "Fresh pasta",
                prepTimeMinutes = 25,
                difficulty = RecipeDifficulty.MEDIUM,
                imageUrl = null,
                calories = 600,
                ingredients =
                    mutableListOf(
                        RecipeIngredientRequest(ingredient.ingredientId!!, 2.0, "pcs"),
                    ),
                categoryIds = setOf(category.categoryId!!),
            )

        Mockito.`when`(userRepository.findUserByEmail(owner.email)).thenReturn(owner)
        Mockito.`when`(ingredientRepository.findById(ingredient.ingredientId!!)).thenReturn(Optional.of(ingredient))
        Mockito.`when`(categoryRepository.findById(category.categoryId!!)).thenReturn(Optional.of(category))
        Mockito.`when`(recipeRepository.save(Mockito.any(com.platr.api.entity.Recipe::class.java))).thenAnswer { invocation ->
            invocation.arguments[0] as com.platr.api.entity.Recipe
        }

        val result = recipeService.createRecipe(request, owner.email)

        assertEquals("Pasta", result.title)
        assertEquals(owner.username, result.ownerUsername)
        assertEquals(setOf(CategoryType.ITALIAN), result.categoryTypes)
    }

    @Test
    fun `addReview rejects users reviewing their own recipe`() {
        val owner = ServiceTestFixtures.user()
        val recipe = ServiceTestFixtures.recipe(owner = owner)
        val reviewRequest = ReviewRequest(rating = 5, text = "Excellent")

        Mockito.`when`(recipeRepository.findById(recipe.recipeId!!)).thenReturn(Optional.of(recipe))
        Mockito.`when`(userRepository.findUserByEmail(owner.email)).thenReturn(owner)
        Mockito.`when`(recipeRepository.existsByRecipeIdAndOwnerUserId(recipe.recipeId!!, owner.userId!!)).thenReturn(true)

        val exception =
            assertThrows(ResponseStatusException::class.java) {
                recipeService.addReview(recipe.recipeId!!, reviewRequest, owner.email)
            }

        assertEquals(HttpStatus.CONFLICT, exception.statusCode)
    }

    @Test
    fun `getRecipesByCategory rejects invalid UUID input`() {
        val pageable = Pageable.unpaged()
        val exception =
            assertThrows(ResponseStatusException::class.java) {
                recipeService.getRecipesByCategory("invalid-uuid", pageable)
            }

        assertEquals(HttpStatus.BAD_REQUEST, exception.statusCode)
    }
}
