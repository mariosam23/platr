package com.platr.api.service

import com.platr.api.enums.CategoryType
import com.platr.api.repository.CategoryRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito

class CategoryServiceTest {
    private val categoryRepository: CategoryRepository = Mockito.mock(CategoryRepository::class.java)
    private val categoryService = CategoryService(categoryRepository)

    @Test
    fun `getAllCategories maps repository entities to DTOs`() {
        val italian = ServiceTestFixtures.category(type = CategoryType.ITALIAN)
        val vegan = ServiceTestFixtures.category(type = CategoryType.VEGAN)
        Mockito.`when`(categoryRepository.findAll()).thenReturn(listOf(italian, vegan))

        val result = categoryService.getAllCategories()

        assertEquals(2, result.size)
        assertEquals(italian.categoryId, result[0].categoryId)
        assertEquals("ITALIAN", result[0].categoryType)
        assertEquals("VEGAN", result[1].categoryType)
    }
}
