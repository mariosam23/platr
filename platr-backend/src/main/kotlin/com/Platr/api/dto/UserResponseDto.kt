package com.Platr.api.dto

import com.Platr.api.enums.Role
import java.time.Instant
import java.util.UUID

data class UserResponseDto(
    val userId: UUID,
    val username: String,
    val email: String,
    val displayedName: String,
    val roles: Set<Role>,

    val createdAt: Instant?,
)