package com.platr.api.controller

import com.platr.api.dto.AuthResponse
import com.platr.api.dto.LoginRequest
import com.platr.api.dto.RefreshTokenRequest
import com.platr.api.dto.RegisterRequest
import com.platr.api.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
) {
    @PostMapping("/register")
    fun register(
        @Valid @RequestBody request: RegisterRequest,
    ): ResponseEntity<AuthResponse> = ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request))

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequest,
    ): ResponseEntity<AuthResponse> = ResponseEntity.ok(authService.login(request))

    @PostMapping("/refresh")
    fun refreshToken(
        @Valid @RequestBody request: RefreshTokenRequest,
    ): ResponseEntity<AuthResponse> {
        val token = request.refreshToken
        val response = authService.refresh(token)

        return ResponseEntity.ok(response)
    }
}
