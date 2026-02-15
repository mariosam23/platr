package com.Platr.api.controller

import com.Platr.api.dto.UserRequestDto
import com.Platr.api.dto.UserResponseDto
import com.Platr.api.entity.User
import com.Platr.api.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService,
    private val passwordEncoder: PasswordEncoder
) {
    @PostMapping
    fun create(@RequestBody userRequestDto: UserRequestDto): UserResponseDto {
        val savedUser = userService.createUser(userRequestDto.toModel())
        return savedUser.toResponseDto()
    }

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
        recipesCount = this.recipes.size,
        mealPlansCount = this.mealPlans.size,
        createdAt = this.createdAt,
    )

    private fun UserRequestDto.toModel() = User(
        username = this.username,
        email = this.email,
        hashedPassword = passwordEncoder.encode(this.password),
        displayedName = this.displayedName,
        roles = emptySet()
    )
}