package com.platr.api.service

import com.platr.api.entity.User
import com.platr.api.enums.Role
import com.platr.api.exception.UserAlreadyExistsException
import com.platr.api.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.springframework.security.crypto.password.PasswordEncoder

class UserServiceTest {
    private val userRepository: UserRepository = Mockito.mock(UserRepository::class.java)
    private val passwordEncoder: PasswordEncoder = Mockito.mock(PasswordEncoder::class.java)
    private val userService = UserService(userRepository, passwordEncoder)

    private fun testUser() =
        User(
            username = "sam",
            email = "sam@example.com",
            hashedPassword = "hash",
            roles = setOf(Role.USER),
        )

    @Test
    fun `createUser throws when username already exists`() {
        val user = testUser()
        Mockito.`when`(userRepository.findUserByUsername(user.username)).thenReturn(testUser())

        assertThrows(UserAlreadyExistsException::class.java) {
            userService.createUser(user)
        }

        verify(userRepository, never()).save(Mockito.any(User::class.java))
    }

    @Test
    fun `createUser saves and returns user when username and email are unique`() {
        val user = testUser()
        val savedUser = testUser().apply { userId = java.util.UUID.randomUUID() }

        Mockito.`when`(userRepository.findUserByUsername(user.username)).thenReturn(null)
        Mockito.`when`(userRepository.findUserByEmail(user.email)).thenReturn(null)
        Mockito.`when`(userRepository.save(user)).thenReturn(savedUser)

        val result = userService.createUser(user)

        assertEquals(savedUser.userId, result.userId)
        verify(userRepository).save(user)
    }
}
