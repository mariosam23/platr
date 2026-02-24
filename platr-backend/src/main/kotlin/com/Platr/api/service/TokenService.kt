package com.Platr.api.service

import com.Platr.api.config.JwtConfig
import io.jsonwebtoken.Claims
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import java.util.Date

@Service
class TokenService(
    private val jwtConfig: JwtConfig,
) {
    companion object {
        private val logger = LoggerFactory.getLogger(TokenService::class.java)
    }

    private val secretKey = Keys.hmacShaKeyFor(
        jwtConfig.secret.toByteArray()
    )

    fun generateAccessToken(userDetails: UserDetails): String {
        return generateToken(userDetails, jwtConfig.accessTokenExpiration, "access")
    }

    fun generateRefreshToken(userDetails: UserDetails): String {
        return generateToken(userDetails, jwtConfig.refreshTokenExpiration, "refresh")
    }

    /**
     * Generates JWT with claims, expiration, and signature
     */
    private fun generateToken(userDetails: UserDetails, expirationMillis: Long, type: String): String {
        val now = Date()
        val expiryDate = Date(now.time + expirationMillis)

        return Jwts.builder()
            .subject(userDetails.username)
            .claim("role", userDetails.authorities.map { it.authority })
            .claim("type", type)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact()
    }

    fun isValid(token: String, userDetails: UserDetails, type: String): Boolean {
        val claims = getAllClaims(token) ?: return false
        if (claims["type"] != type) return false
        val username = claims.subject ?: return false
        return username == userDetails.username && !claims.expiration.before(Date())
    }

    private fun isExpired(token: String): Boolean {
        val expiration = getAllClaims(token)?.expiration ?: return true
        return expiration.before(Date())
    }

    fun extractUsername(token: String): String? {
        return try {
            getAllClaims(token)?.subject
        } catch (e: Exception) {
            logger.error("Failed to extract username from token: ${e.message}")
            null // if extraction fails
        }
    }

    private fun getAllClaims(token: String): Claims? {
        return try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .payload
        } catch (e: JwtException) {
            logger.error("JWT parsing error: ${e.message}")
            null // Handles expired, malformed, or invalid signature tokens
        } catch (e: IllegalArgumentException) {
            logger.error("Invalid token argument: ${e.message}")
            null
        }
    }
}