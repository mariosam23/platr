package com.platr.api.controller

import com.platr.api.dto.request.LoginRequest
import com.platr.api.dto.request.RefreshTokenRequest
import com.platr.api.dto.request.RegisterRequest
import com.platr.api.service.AuthService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.http.HttpStatus

class AuthControllerTest {
    private val authService: AuthService = Mockito.mock(AuthService::class.java)
    private val authController = AuthController(authService)

    @Test
    fun `register returns created response from service`() {
        val request = RegisterRequest(username = "sam", email = "sam@example.com", password = "password123")
        val responseBody = ControllerTestFixtures.authResponse()
        Mockito.`when`(authService.register(request)).thenReturn(responseBody)

        val response = authController.register(request)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        assertEquals(responseBody, response.body)
    }

    @Test
    fun `login returns ok response from service`() {
        val request = LoginRequest(email = "sam@example.com", password = "password123")
        val responseBody = ControllerTestFixtures.authResponse()
        Mockito.`when`(authService.login(request)).thenReturn(responseBody)

        val response = authController.login(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(responseBody, response.body)
    }

    @Test
    fun `refresh delegates refresh token to service`() {
        val request = RefreshTokenRequest(refreshToken = "refresh-token")
        val responseBody = ControllerTestFixtures.authResponse()
        Mockito.`when`(authService.refresh(request.refreshToken)).thenReturn(responseBody)

        val response = authController.refreshToken(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(responseBody, response.body)
        Mockito.verify(authService).refresh(request.refreshToken)
    }
}
