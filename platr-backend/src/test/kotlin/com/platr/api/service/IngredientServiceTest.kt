package com.platr.api.service

import com.platr.api.entity.Ingredient
import com.platr.api.repository.IngredientRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import java.util.UUID

class IngredientServiceTest {
    private val ingredientRepository: IngredientRepository = mock(IngredientRepository::class.java)
    private val ingredientService = IngredientService(ingredientRepository)

    @Test
    fun `searchIngredients should return all ingredients when name is null`() {
        // Arrange
        val ingredientId1 = UUID.randomUUID()
        val ingredient1 = Ingredient(ingredientId = ingredientId1, name = "Tomato", unitHint = "pieces")

        `when`(ingredientRepository.findAll()).thenReturn(listOf(ingredient1))

        // Act
        val result = ingredientService.searchIngredients(null)

        // Assert
        assertEquals(1, result.size)
        assertEquals(ingredientId1, result[0].ingredientId)
        assertEquals("Tomato", result[0].name)
        assertEquals("pieces", result[0].unitHint)
    }

    @Test
    fun `searchIngredients should return matching ingredients when name is provided`() {
        // Arrange
        val ingredientId1 = UUID.randomUUID()
        val searchString = " tomato " // Intentionally adding spaces to test trim
        val ingredient1 = Ingredient(ingredientId = ingredientId1, name = "Roma Tomato", unitHint = "pieces")

        `when`(ingredientRepository.findByNameContainingIgnoreCase("tomato")).thenReturn(listOf(ingredient1))

        // Act
        val result = ingredientService.searchIngredients(searchString)

        // Assert
        assertEquals(1, result.size)
        assertEquals(ingredientId1, result[0].ingredientId)
        assertEquals("Roma Tomato", result[0].name)
        assertEquals("pieces", result[0].unitHint)
    }
}
