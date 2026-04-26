package com.platr.api.service

import com.platr.api.enums.Role
import com.platr.api.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.security.core.userdetails.UsernameNotFoundException

class CustomUserDetailsServiceTest {
    private val userRepository: UserRepository = Mockito.mock(UserRepository::class.java)
    private val userDetailsService = CustomUserDetailsService(userRepository)

    @Test
    fun `loadUserByUsername maps user fields and roles into principal`() {
        val user = ServiceTestFixtures.user(roles = setOf(Role.USER, Role.ADMIN))
        Mockito.`when`(userRepository.findUserByEmailWithRoles(user.email)).thenReturn(user)

        val result = userDetailsService.loadUserByUsername(user.email)

        assertEquals(user.email, result.username)
        assertEquals(user.hashedPassword, result.password)
        assertEquals(setOf("ROLE_USER", "ROLE_ADMIN"), result.authorities.map { it.authority }.toSet())
    }

    @Test
    fun `loadUserByUsername throws when user is missing`() {
        Mockito.`when`(userRepository.findUserByEmailWithRoles("missing@example.com")).thenReturn(null)

        assertThrows(UsernameNotFoundException::class.java) {
            userDetailsService.loadUserByUsername("missing@example.com")
        }
    }
}
