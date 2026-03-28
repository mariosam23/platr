package com.platr.api.controller

import com.platr.api.service.IngredientService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

data class IngredientDto(
    val ingredientId: UUID,
    val name: String,
    val unitHint: String?,
)

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
