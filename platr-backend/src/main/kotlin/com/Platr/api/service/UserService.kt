package com.Platr.api.service

import com.Platr.api.dto.UserResponseDto
import com.Platr.api.entity.User
import com.Platr.api.exception.UserNotFoundException
import com.Platr.api.exception.UserAlreadyExistsException
import com.Platr.api.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.ResponseStatus
import java.beans.BeanProperty
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {
    companion object {
        private val logger = LoggerFactory.getLogger(UserService::class.java)
    }

    @Transactional
    fun createUser(user: User): User {
        val existingUser = userRepository.findUserByEmail(user.email)
        if (existingUser != null) {
            logger.warn("Attempt to create user with existing email: ${user.email}")
            throw UserAlreadyExistsException("User with email ${user.email} already exists")
        }

        logger.info("Creating new user with email: ${user.email}")
        return userRepository.save(user)
    }

    @Transactional(readOnly = true)
    fun findByEmail(email: String): User? {
        return userRepository.findUserByEmail(email)
    }

    @Transactional(readOnly = true)
    fun findById(id: UUID): User {
        if (!userRepository.existsById(id)) {
            logger.warn("User with id $id not found")
            throw UserNotFoundException("User with id $id not found")
        }

        logger.info("Finding user with id: $id")
        return userRepository.findById(id).get()
    }

    @Transactional(readOnly = true)
    fun findAll(): List<User> {
        return userRepository.findAll()
    }

    @Transactional
    fun deleteById(id: UUID) {
        if (!userRepository.existsById(id)) {
            throw UserNotFoundException("User with id $id not found")
        }

        logger.info("Deleting user with id: $id")
        userRepository.deleteById(id)
    }

    fun encodeUserPassword(rawPassword: String): String? {
        return passwordEncoder.encode(rawPassword)
    }
}