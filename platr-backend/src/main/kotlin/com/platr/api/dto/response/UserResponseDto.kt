package com.platr.api.dto.response

import com.platr.api.entity.User
import com.platr.api.enums.Role
import java.time.Instant

data class UserResponseDto(
    val username: String,
    val email: String,
    val roles: Set<Role>,
    val createdAt: Instant?,
)

fun User.toResponseDto() =
    UserResponseDto(
        username = this.username,
        email = this.email,
        roles = this.roles,
        createdAt = this.createdAt,
    )
