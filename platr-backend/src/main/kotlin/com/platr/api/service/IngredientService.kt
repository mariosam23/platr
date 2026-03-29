package com.platr.api.service

import com.platr.api.dto.response.IngredientDto
import com.platr.api.repository.IngredientRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class IngredientService(
    private val ingredientRepository: IngredientRepository,
) {
    @Transactional(readOnly = true)
    fun searchIngredients(name: String?): List<IngredientDto> {
        val ingredients =
            if (name == null) {
                ingredientRepository.findAll()
            } else {
                ingredientRepository.findByNameContainingIgnoreCase(name.trim())
            }

        return ingredients.map {
            IngredientDto(
                ingredientId = it.ingredientId!!,
                name = it.name,
                unitHint = it.unitHint,
            )
        }
    }
}
