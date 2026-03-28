package com.platr.api.controller

import com.platr.api.service.CategoryService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

data class CategoryDto(
    val categoryId: UUID,
    val categoryType: String,
)

@RestController
@RequestMapping("/api/categories")
class CategoryController(
    private val categoryService: CategoryService,
) {
    @GetMapping
    fun getAll(): ResponseEntity<List<CategoryDto>> {
        val categories = categoryService.getAllCategories()
        return ResponseEntity.ok(categories)
    }
}
