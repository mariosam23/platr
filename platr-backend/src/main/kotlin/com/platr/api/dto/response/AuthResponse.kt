package com.platr.api.dto.response

data class AuthResponse(
    val jwtToken: String,
    val refreshToken: String,
    val username: String,
    val role: String,
)
