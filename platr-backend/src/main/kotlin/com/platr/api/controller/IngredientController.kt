package com.platr.api.controller

import com.platr.api.dto.response.IngredientDto
import com.platr.api.service.IngredientService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/ingredients")
class IngredientController(
    private val ingredientService: IngredientService,
) {
    @GetMapping
    fun search(
        @RequestParam(required = false) search: String?,
    ): ResponseEntity<List<IngredientDto>> {
        val ingredients = ingredientService.searchIngredients(search)
        return ResponseEntity.ok(ingredients)
    }
}
