package com.platr.api.controller

import com.platr.api.service.CategoryService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.http.HttpStatus

class CategoryControllerTest {
    private val categoryService: CategoryService = Mockito.mock(CategoryService::class.java)
    private val categoryController = CategoryController(categoryService)

    @Test
    fun `getAll returns categories from service`() {
        val categories = listOf(ControllerTestFixtures.categoryDto())
        Mockito.`when`(categoryService.getAllCategories()).thenReturn(categories)

        val response = categoryController.getAll()

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(categories, response.body)
    }
}
