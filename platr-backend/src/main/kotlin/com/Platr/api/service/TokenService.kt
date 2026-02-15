package com.Platr.api.service

import com.Platr.api.config.JwtConfig
import io.jsonwebtoken.Claims
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Service

@Service
class TokenService(
    jwtConfig: JwtConfig
) {
    private val secretKey = Keys.hmacShaKeyFor(
        jwtConfig.secret.toByteArray()
    )

    fun generate(): String {
        return "TODO"
    }

    fun isValid(): Boolean = false

    fun isExpired(): Boolean = false

    private fun getAllClaims(): Claims? {
        return null
    }
}