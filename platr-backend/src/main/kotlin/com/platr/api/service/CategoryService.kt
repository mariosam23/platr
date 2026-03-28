package com.platr.api.service

import com.platr.api.controller.CategoryDto
import com.platr.api.repository.CategoryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CategoryService(
    private val categoryRepository: CategoryRepository
) {
    @Transactional(readOnly = true)
    fun getAllCategories(): List<CategoryDto> {
        return categoryRepository.findAll().map {
            CategoryDto(
                categoryId = it.categoryId!!,
                categoryType = it.categoryType.name
            )
        }
    }
}
