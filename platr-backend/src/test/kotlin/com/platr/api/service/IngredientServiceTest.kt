package com.platr.api.service

import com.platr.api.repository.IngredientRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito

class IngredientServiceTest {
    private val ingredientRepository: IngredientRepository = Mockito.mock(IngredientRepository::class.java)
    private val ingredientService = IngredientService(ingredientRepository)

    @Test
    fun `searchIngredients returns all ingredients when name is null`() {
        val ingredients = listOf(ServiceTestFixtures.ingredient(name = "Tomato"), ServiceTestFixtures.ingredient(name = "Basil"))
        Mockito.`when`(ingredientRepository.findAll()).thenReturn(ingredients)

        val result = ingredientService.searchIngredients(null)

        assertEquals(2, result.size)
        assertEquals("Tomato", result[0].name)
        Mockito.verify(ingredientRepository).findAll()
    }

    @Test
    fun `searchIngredients trims the search term before querying repository`() {
        val milk = ServiceTestFixtures.ingredient(name = "Milk", unitHint = "ml")
        Mockito.`when`(ingredientRepository.findByNameContainingIgnoreCase("milk")).thenReturn(listOf(milk))

        val result = ingredientService.searchIngredients("  milk  ")

        assertEquals(1, result.size)
        assertEquals("Milk", result[0].name)
        Mockito.verify(ingredientRepository).findByNameContainingIgnoreCase("milk")
    }
}
