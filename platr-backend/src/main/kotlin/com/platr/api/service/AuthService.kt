package com.platr.api.service

import com.platr.api.config.AuthenticatedUserPrincipal
import com.platr.api.dto.response.AuthResponse
import com.platr.api.dto.request.LoginRequest
import com.platr.api.dto.request.RegisterRequest
import com.platr.api.dto.toUser
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class AuthService(
    private val authenticationManager: AuthenticationManager,
    private val userDetailsService: UserDetailsService,
    private val tokenService: TokenService,
    private val userService: UserService,
    private val passwordEncoder: PasswordEncoder,
) {
    companion object {
        private val logger = LoggerFactory.getLogger(AuthService::class.java)
    }

    @Transactional
    fun register(userRequest: RegisterRequest): AuthResponse {
        val userToCreate = userRequest.toUser(passwordEncoder)
        userService.createUser(userToCreate)

        val userDetails = userDetailsService.loadUserByUsername(userRequest.email) as AuthenticatedUserPrincipal
        val accessToken = tokenService.generateAccessToken(userDetails)
        val refreshToken = tokenService.generateRefreshToken(userDetails)

        logger.info("New user registered: ${userRequest.email}")
        return AuthResponse(
            jwtToken = accessToken,
            refreshToken = refreshToken,
        )
    }

    @Transactional
    fun login(request: LoginRequest): AuthResponse {
        try {
            authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(request.email, request.password),
            )
        } catch (e: BadCredentialsException) {
            logger.warn("Failed login attempt for email: ${request.email}")
            throw BadCredentialsException("Invalid email or password", e)
        }

        val userDetails = userDetailsService.loadUserByUsername(request.email) as AuthenticatedUserPrincipal
        val accessToken = tokenService.generateAccessToken(userDetails)
        val refreshToken = tokenService.generateRefreshToken(userDetails)

        logger.info("User logged in: ${request.email}")
        return AuthResponse(
            jwtToken = accessToken,
            refreshToken = refreshToken,
        )
    }

    @Transactional
    fun refresh(refreshToken: String): AuthResponse {
        val email =
            tokenService.extractEmail(refreshToken)
                ?: throw ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid token claims")

        val userDetails = userDetailsService.loadUserByUsername(email) as AuthenticatedUserPrincipal

        if (!tokenService.isValid(refreshToken, userDetails, type = "refresh")) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid or expired refresh token")
        }

        val newAccessToken = tokenService.generateAccessToken(userDetails)
        val newRefreshToken = tokenService.generateRefreshToken(userDetails)

        return AuthResponse(
            jwtToken = newAccessToken,
            refreshToken = newRefreshToken,
        )
    }
}
