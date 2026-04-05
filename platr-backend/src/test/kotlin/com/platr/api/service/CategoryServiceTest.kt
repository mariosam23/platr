package com.platr.api.service

import com.platr.api.entity.Category
import com.platr.api.enums.CategoryType
import com.platr.api.repository.CategoryRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import java.util.UUID

class CategoryServiceTest {
    private val categoryRepository: CategoryRepository = mock(CategoryRepository::class.java)
    private val categoryService = CategoryService(categoryRepository)

    @Test
    fun `getAllCategories should return mapped categories`() {
        // Arrange
        val categoryId1 = UUID.randomUUID()
        val categoryId2 = UUID.randomUUID()

        val category1 = Category(categoryId = categoryId1, categoryType = CategoryType.VEGAN)
        val category2 = Category(categoryId = categoryId2, categoryType = CategoryType.ITALIAN)

        `when`(categoryRepository.findAll()).thenReturn(listOf(category1, category2))

        // Act
        val result = categoryService.getAllCategories()

        // Assert
        assertNotNull(result)
        assertEquals(2, result.size)

        assertEquals(categoryId1, result[0].categoryId)
        assertEquals("VEGAN", result[0].categoryType)

        assertEquals(categoryId2, result[1].categoryId)
        assertEquals("ITALIAN", result[1].categoryType)
    }
}
