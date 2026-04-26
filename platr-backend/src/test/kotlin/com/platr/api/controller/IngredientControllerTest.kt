package com.platr.api.controller

import com.platr.api.service.IngredientService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.http.HttpStatus

class IngredientControllerTest {
    private val ingredientService: IngredientService = Mockito.mock(IngredientService::class.java)
    private val ingredientController = IngredientController(ingredientService)

    @Test
    fun `search returns filtered ingredients from service`() {
        val ingredients = listOf(ControllerTestFixtures.ingredientDto())
        Mockito.`when`(ingredientService.searchIngredients("tom")).thenReturn(ingredients)

        val response = ingredientController.search("tom")

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(ingredients, response.body)
    }

    @Test
    fun `search forwards null search term`() {
        val ingredients = listOf(ControllerTestFixtures.ingredientDto())
        Mockito.`when`(ingredientService.searchIngredients(null)).thenReturn(ingredients)

        val response = ingredientController.search(null)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(ingredients, response.body)
        Mockito.verify(ingredientService).searchIngredients(null)
    }
}
