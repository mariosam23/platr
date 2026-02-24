package com.Platr.api.service

import com.Platr.api.entity.User
import com.Platr.api.exception.UserNotFoundException
import com.Platr.api.exception.UserAlreadyExistsException
import com.Platr.api.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
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
        if (userRepository.findUserByUsername(user.username) != null) {
            logger.warn("User with username ${user.username} already exists")
            throw UserAlreadyExistsException("Username already exists")
        }

        if (userRepository.findUserByEmail(user.email) != null) {
            logger.warn("User with email ${user.email} already exists")
            throw UserAlreadyExistsException("Email already exists")
        }

        logger.info("Creating new user with email: ${user.email}")
        return try {
            userRepository.save(user)
        } catch (ex: DataIntegrityViolationException) {
            logger.warn("User creation failed due to unique constraint conflict for email: ${user.email}")
            throw UserAlreadyExistsException("User already exists")
        }
    }

    @Transactional(readOnly = true)
    fun findByEmail(email: String): User? {
        return userRepository.findUserByEmail(email)
    }

    @Transactional(readOnly = true)
    fun findById(id: UUID): User {
        logger.info("Finding user with id: $id")
        return userRepository.findByIdWithRoles(id)
            ?: run {
                logger.warn("User with id $id not found")
                throw UserNotFoundException("User with id $id not found")
            }
    }

    @Transactional(readOnly = true)
    fun findAll(): List<User> {
        return userRepository.findAllWithRoles()
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