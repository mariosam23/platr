package com.platr.api.config

import com.platr.api.entity.User
import com.platr.api.enums.Role
import com.platr.api.repository.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class ApplicationInitializer(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    @Value("\${admin.username}") private val adminUsername: String,
    @Value("\${admin.password}") private val adminPassword: String,
    @Value("\${admin.email}") private val adminEmail: String,
) : CommandLineRunner {
    override fun run(vararg args: String) {
        val admin = userRepository.findUserByEmail(adminEmail)
        if (admin == null) {
            val adminUser =
                User(
                    username = adminUsername,
                    email = adminEmail,
                    hashedPassword = passwordEncoder.encode(adminPassword) ?: throw IllegalStateException("Failed to encode password"),
                    displayedName = "Admin",
                    roles = setOf(Role.ADMIN),
                    recipes = mutableListOf(),
                    mealPlans = mutableListOf(),
                    reviews = mutableListOf(),
                )

            userRepository.save(adminUser)
        }
    }
}
