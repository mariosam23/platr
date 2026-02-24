package com.Platr.api.controller

import com.Platr.api.dto.RecipeDetailDto
import com.Platr.api.dto.RecipeRequest
import com.Platr.api.dto.RecipeSummaryDto
import com.Platr.api.dto.ReviewRequest
import com.Platr.api.dto.ReviewResponse
import com.Platr.api.service.RecipeService
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/recipes")
class RecipeController(
    private val recipeService: RecipeService
) {
    @GetMapping
    fun getAllRecipes(
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) category: String?,
        pageable: Pageable,
    ): ResponseEntity<Page<RecipeSummaryDto>> {
        val filters = mutableMapOf<String, String>()
        if (!category.isNullOrBlank()) {
            filters["categoryId"] = category
        }

        val recipes = recipeService.searchRecipes(search.orEmpty(), filters, pageable)
        return ResponseEntity.ok(recipes)
    }

    @GetMapping("/{id}")
    fun getRecipeDetail(@PathVariable id: UUID): ResponseEntity<RecipeDetailDto> {
        val recipeDetail = recipeService.getRecipeDetail(id)
        return ResponseEntity.ok(recipeDetail)
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun createRecipe(
        @Valid @RequestBody request: RecipeRequest,
        authentication: Authentication
    ): ResponseEntity<RecipeSummaryDto> {
        val userEmail = authentication.name
        val createdRecipe = recipeService.createRecipe(request, userEmail)

        return ResponseEntity.status(HttpStatus.CREATED).body(createdRecipe)
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @recipeSecurity.isOwner(authentication, #id)")
    fun updateRecipe(
        @PathVariable id: UUID,
        @Valid @RequestBody request: RecipeRequest,
        authentication: Authentication,
    ): ResponseEntity<RecipeSummaryDto> {
        val userEmail = authentication.name
        val updatedRecipe = recipeService.updateRecipe(id, request, userEmail)

        return ResponseEntity.ok(updatedRecipe)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @recipeSecurity.isOwner(authentication, #id)")
    fun deleteRecipe(@PathVariable id: UUID): ResponseEntity<Void> {
        recipeService.deleteRecipe(id.toString())
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/reviews")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun addReview(
        @PathVariable id: UUID,
        @Valid @RequestBody reviewRequest: ReviewRequest,
        authentication: Authentication,
    ): ResponseEntity<ReviewResponse> {
        val userEmail = authentication.name
        val reviewResponse = recipeService.addReview(id, reviewRequest, userEmail)
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewResponse)
    }
}