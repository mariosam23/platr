package com.platr.api.dto.response

import java.util.UUID

data class IngredientDto(
    val ingredientId: UUID,
    val name: String,
    val unitHint: String?,
)
