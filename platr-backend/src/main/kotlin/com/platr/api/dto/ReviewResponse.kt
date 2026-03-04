package com.platr.api.dto

import java.time.Instant
import java.util.UUID

data class ReviewResponse(
    val reviewId: UUID?,
    val rating: Int,
    val text: String,
    val ownerId: UUID?,
    val ownerUsername: String,
    val createdAt: Instant,
)
