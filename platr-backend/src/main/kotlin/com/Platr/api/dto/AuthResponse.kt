package com.Platr.api.dto


data class AuthResponse(
    val jwtToken: String,
    val refreshToken: String,
    val username: String,
    val role: String,
)
