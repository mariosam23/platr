package com.platr.api.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class ReviewRequest(
    @field:Min(1, message = "Rating must be at least 1")
    @field:Max(5, message = "Rating must be at most 5")
    val rating: Int,
    @field:NotBlank(message = "Text is required")
    @field:Size(min = 5, max = 1000, message = "Text must be between 5 and 1000 chars")
    val text: String,
)
