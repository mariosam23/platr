package com.Platr.api.dto

import com.Platr.api.entity.User
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

fun User.toResponseDto() = UserResponseDto(
    userId = this.userId!!,
    username = this.username,
    email = this.email,
    displayedName = this.displayedName,
    roles = this.roles,
    createdAt = this.createdAt,
)