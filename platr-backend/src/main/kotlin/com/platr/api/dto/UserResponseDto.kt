package com.platr.api.dto

import com.platr.api.entity.User
import com.platr.api.enums.Role
import java.time.Instant

data class UserResponseDto(
    val username: String,
    val email: String,
    val displayedName: String,
    val roles: Set<Role>,
    val createdAt: Instant?,
)

fun User.toResponseDto() =
    UserResponseDto(
        username = this.username,
        email = this.email,
        displayedName = this.displayedName,
        roles = this.roles,
        createdAt = this.createdAt,
    )
