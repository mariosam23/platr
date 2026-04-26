package com.platr.api.controller

import com.platr.api.dto.request.RecipeIngredientRequest
import com.platr.api.dto.request.RecipeRequest
import com.platr.api.dto.request.ReviewRequest
import com.platr.api.enums.RecipeDifficulty
import com.platr.api.service.RecipeService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import java.util.UUID

class RecipeControllerTest {
    private val recipeService: RecipeService = Mockito.mock(RecipeService::class.java)
    private val recipeController = RecipeController(recipeService)

    @Test
    fun `getAllRecipes builds filters and delegates to search service`() {
        val pageable = Pageable.unpaged()
        val page = PageImpl(listOf(ControllerTestFixtures.recipeSummaryDto()))
        Mockito
            .`when`(
                recipeService.searchRecipes(
                    "pasta",
                    mapOf("categoryId" to "cat-1", "ingredientIds" to "ing-1,ing-2"),
                    pageable,
                ),
            ).thenReturn(page)

        val response = recipeController.getAllRecipes("pasta", "cat-1", "ing-1,ing-2", pageable)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(page, response.body)
    }

    @Test
    fun `createRecipe returns created response for authenticated user`() {
        val authentication: Authentication = Mockito.mock(Authentication::class.java)
        val request =
            RecipeRequest(
                title = "Pasta",
                description = "Fresh pasta",
                prepTimeMinutes = 20,
                difficulty = RecipeDifficulty.EASY,
                imageUrl = null,
                calories = 500,
                ingredients =
                    mutableListOf(
                        RecipeIngredientRequest(
                            ingredientId = UUID.randomUUID(),
                            quantity = 2.0,
                            unit = "pcs",
                        ),
                    ),
                categoryIds = emptySet(),
            )
        val recipe = ControllerTestFixtures.recipeSummaryDto()
        Mockito.`when`(authentication.name).thenReturn("sam@example.com")
        Mockito.`when`(recipeService.createRecipe(request, "sam@example.com")).thenReturn(recipe)

        val response = recipeController.createRecipe(request, authentication)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        assertEquals(recipe, response.body)
    }

    @Test
    fun `addReview returns created response`() {
        val authentication: Authentication = Mockito.mock(Authentication::class.java)
        val recipeId = UUID.randomUUID()
        val request = ReviewRequest(rating = 5, text = "Excellent recipe")
        val review = ControllerTestFixtures.reviewResponse()
        Mockito.`when`(authentication.name).thenReturn("sam@example.com")
        Mockito.`when`(recipeService.addReview(recipeId, request, "sam@example.com")).thenReturn(review)

        val response = recipeController.addReview(recipeId, request, authentication)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        assertEquals(review, response.body)
    }
}
