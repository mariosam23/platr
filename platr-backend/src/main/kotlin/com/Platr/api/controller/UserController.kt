package com.Platr.api.controller

import com.Platr.api.dto.UserResponseDto
import com.Platr.api.entity.User
import com.Platr.api.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService,
) {
    @GetMapping
    fun getAll(): List<UserResponseDto> {
        return userService.findAll().map { it.toResponseDto() }
    }

    @GetMapping("/{uuid}")
    fun findByUUID(@PathVariable uuid: UUID): UserResponseDto {
        return userService.findById(uuid)
            ?.toResponseDto()
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.")
    }

    @DeleteMapping("/{uuid}")
    fun deleteByUUID(@PathVariable uuid: UUID) {
        userService.deleteById(uuid)
    }

    private fun User.toResponseDto() = UserResponseDto(
        userId = this.userId!!,
        username = this.username,
        email = this.email,
        displayedName = this.displayedName,
        roles = this.roles,
        createdAt = this.createdAt,
    )
}