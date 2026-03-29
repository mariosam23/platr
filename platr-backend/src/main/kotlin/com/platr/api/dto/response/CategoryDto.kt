package com.platr.api.dto.response

import java.util.UUID

data class CategoryDto(
    val categoryId: UUID,
    val categoryType: String,
)
