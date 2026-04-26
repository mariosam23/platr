package com.platr.api.service

import com.platr.api.config.AuthenticatedUserPrincipal
import com.platr.api.config.JwtConfig
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.security.core.authority.SimpleGrantedAuthority
import java.util.UUID

class TokenServiceTest {
    private val jwtConfig =
        JwtConfig(
            secret = "test-secret-key-12345678901234567890",
            accessTokenExpiration = 60_000L,
            refreshTokenExpiration = 120_000L,
        )

    private val tokenService = TokenService(jwtConfig)

    private fun testPrincipal() =
        AuthenticatedUserPrincipal(
            id = UUID.randomUUID(),
            displayUsername = "sam",
            email = "sam@example.com",
            passwordHash = "hashed-password",
            grantedAuthorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        )

    @Test
    fun `generated access token is valid for matching user and type`() {
        val principal = testPrincipal()
        val token = tokenService.generateAccessToken(principal)

        assertNotNull(tokenService.extractEmail(token))
        assertTrue(tokenService.isValid(token, principal, "access"))
    }

    @Test
    fun `token validation fails for wrong token type`() {
        val principal = testPrincipal()
        val refreshToken = tokenService.generateRefreshToken(principal)

        assertFalse(tokenService.isValid(refreshToken, principal, "access"))
    }

    @Test
    fun `extractEmail returns null for malformed token`() {
        assertNull(tokenService.extractEmail("not-a-jwt"))
    }
}
