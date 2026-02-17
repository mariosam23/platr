package com.Platr.api.controller

import com.Platr.api.dto.UserResponseDto
import com.Platr.api.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import com.Platr.api.dto.toResponseDto
import org.springframework.security.access.prepost.PreAuthorize
import java.util.UUID

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService,
) {
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    fun getAll(): List<UserResponseDto> {
        return userService.findAll().map { it.toResponseDto() }
    }

    @PreAuthorize("hasRole('ADMIN') or #uuid == authentication.principal.id")
    @GetMapping("/{uuid}")
    fun findByUUID(@PathVariable uuid: UUID): UserResponseDto {
        return userService.findById(uuid)
            .toResponseDto()
    }

    @PreAuthorize("hasRole('ADMIN') or #uuid == authentication.principal.id")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{uuid}")
    fun deleteByUUID(@PathVariable uuid: UUID) {
        userService.deleteById(uuid)
    }
}