package com.platr.api.controller

import com.platr.api.service.ServiceTestFixtures
import com.platr.api.service.UserService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import java.util.UUID

class UserControllerTest {
    private val userService: UserService = Mockito.mock(UserService::class.java)
    private val userController = UserController(userService)

    @Test
    fun `getAll maps users to response DTOs`() {
        val users = listOf(ServiceTestFixtures.user(username = "sam", email = "sam@example.com"))
        Mockito.`when`(userService.findAll()).thenReturn(users)

        val response = userController.getAll()

        assertEquals(1, response.size)
        assertEquals("sam", response[0].username)
        assertEquals("sam@example.com", response[0].email)
    }

    @Test
    fun `findByUUID maps service result to response DTO`() {
        val userId = UUID.randomUUID()
        val user = ServiceTestFixtures.user(id = userId, username = "sam", email = "sam@example.com")
        Mockito.`when`(userService.findById(userId)).thenReturn(user)

        val response = userController.findByUUID(userId)

        assertEquals("sam", response.username)
        assertEquals("sam@example.com", response.email)
    }

    @Test
    fun `deleteByUUID delegates to service`() {
        val userId = UUID.randomUUID()

        userController.deleteByUUID(userId)

        Mockito.verify(userService).deleteById(userId)
    }
}
