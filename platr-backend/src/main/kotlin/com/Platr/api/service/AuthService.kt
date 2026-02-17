package com.Platr.api.service

import com.Platr.api.dto.AuthResponse
import com.Platr.api.dto.LoginRequest
import com.Platr.api.dto.UserRequestDto
import com.Platr.api.enums.Role
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
    private val passwordEncoder: PasswordEncoder
) {
    companion object {
        private val logger = LoggerFactory.getLogger(AuthService::class.java)
    }

    @Transactional
    fun register(userRequest: UserRequestDto): AuthResponse {
        val userToCreate = userRequest.toUser(passwordEncoder)
        userService.createUser(userToCreate)

        val userDetails = userDetailsService.loadUserByUsername(userRequest.email)
        val accessToken = tokenService.generateAccessToken(userDetails)
        val refreshToken = tokenService.generateRefreshToken(userDetails)

        logger.info("New user registered: ${userRequest.email}")
        return AuthResponse(accessToken, refreshToken)
    }

    @Transactional
    fun login(request: LoginRequest): AuthResponse {
        try {
            authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(request.email, request.password)
            )
        } catch (e: BadCredentialsException) {
            logger.warn("Failed login attempt for email: ${request.email}")
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password")
        }

        val userDetails = userDetailsService.loadUserByUsername(request.email)
        val accessToken = tokenService.generateAccessToken(userDetails)
        val refreshToken = tokenService.generateRefreshToken(userDetails)

        logger.info("User logged in: ${request.email}")
        return AuthResponse(accessToken, refreshToken)
    }

    @Transactional
    fun refresh(refreshToken: String): AuthResponse {
        val username = tokenService.extractUsername(refreshToken)
            ?: throw ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid token claims")

        val userDetails = userDetailsService.loadUserByUsername(username)

        if (!tokenService.isValid(refreshToken, userDetails, type = "refresh")) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid or expired refresh token")
        }

        val newAccessToken = tokenService.generateAccessToken(userDetails)
        val newRefreshToken = tokenService.generateRefreshToken(userDetails)

        return AuthResponse(newAccessToken, newRefreshToken)
    }

    private fun UserRequestDto.toUser(passwordEncoder: PasswordEncoder) = com.Platr.api.entity.User(
        username = this.username,
        email = this.email,
        hashedPassword = passwordEncoder.encode(this.password) ?: throw IllegalStateException("Failed to encode password"),
        displayedName = this.displayedName,
        roles = setOf<Role>(Role.USER)
    )
}