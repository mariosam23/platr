package com.platr.api.service

import com.platr.api.config.JwtConfig
import com.platr.api.dto.request.LoginRequest
import com.platr.api.dto.request.RegisterRequest
import com.platr.api.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.server.ResponseStatusException

class AuthServiceTest {
    private val authenticationManager: AuthenticationManager = Mockito.mock(AuthenticationManager::class.java)
    private val userDetailsService: UserDetailsService = Mockito.mock(UserDetailsService::class.java)
    private val userRepository: UserRepository = Mockito.mock(UserRepository::class.java)
    private val passwordEncoder: PasswordEncoder = Mockito.mock(PasswordEncoder::class.java)

    private val tokenService =
        TokenService(
            JwtConfig(
                secret = "test-secret-key-12345678901234567890",
                accessTokenExpiration = 60_000L,
                refreshTokenExpiration = 120_000L,
            ),
        )
    private val userService = UserService(userRepository, passwordEncoder)
    private val emailService = EmailService()
    private val authService =
        AuthService(
            authenticationManager = authenticationManager,
            userDetailsService = userDetailsService,
            tokenService = tokenService,
            userService = userService,
            passwordEncoder = passwordEncoder,
            emailService = emailService,
        )

    @Test
    fun `register creates user and returns JWT tokens`() {
        val request = RegisterRequest(username = "sam", email = "sam@example.com", password = "password123")
        val persistedUser = ServiceTestFixtures.user(username = request.username, email = request.email)
        val principal = ServiceTestFixtures.principal(persistedUser)

        Mockito.`when`(passwordEncoder.encode(request.password)).thenReturn("hashed-password")
        Mockito.`when`(userRepository.findUserByUsername(request.username)).thenReturn(null)
        Mockito.`when`(userRepository.findUserByEmail(request.email)).thenReturn(null)
        Mockito.`when`(userRepository.save(Mockito.any(com.platr.api.entity.User::class.java))).thenAnswer { invocation ->
            invocation.arguments[0] as com.platr.api.entity.User
        }
        Mockito.`when`(userDetailsService.loadUserByUsername(request.email)).thenReturn(principal)

        val result = authService.register(request)

        assertNotNull(result.jwtToken)
        assertNotNull(result.refreshToken)
        Mockito.verify(userRepository).save(Mockito.any(com.platr.api.entity.User::class.java))
        Mockito.verify(userDetailsService).loadUserByUsername(request.email)
    }

    @Test
    fun `login rethrows bad credentials with normalized message`() {
        val request = LoginRequest(email = "sam@example.com", password = "wrong-password")
        Mockito
            .doThrow(BadCredentialsException("bad"))
            .`when`(authenticationManager)
            .authenticate(Mockito.any(UsernamePasswordAuthenticationToken::class.java))

        val exception =
            assertThrows(BadCredentialsException::class.java) {
                authService.login(request)
            }

        assertEquals("Invalid email or password", exception.message)
    }

    @Test
    fun `refresh rejects access token used as refresh token`() {
        val user = ServiceTestFixtures.user()
        val principal = ServiceTestFixtures.principal(user)
        val accessToken = tokenService.generateAccessToken(principal)
        Mockito.`when`(userDetailsService.loadUserByUsername(user.email)).thenReturn(principal)

        val exception =
            assertThrows(ResponseStatusException::class.java) {
                authService.refresh(accessToken)
            }

        assertEquals(HttpStatus.FORBIDDEN, exception.statusCode)
    }
}
