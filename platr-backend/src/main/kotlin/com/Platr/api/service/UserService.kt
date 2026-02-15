package com.Platr.api.service

import com.Platr.api.entity.User
import com.Platr.api.exception.UserNotFoundException
import com.Platr.api.exception.UserAlreadyExistsException
import com.Platr.api.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository
) {
    @Transactional
    fun createUser(user: User): User {
        val existingUser = userRepository.findUserByEmail(user.email)
        if (existingUser != null) {
            throw UserAlreadyExistsException("User with email ${user.email} already exists")
        }

        return userRepository.save(user)
    }

    fun findByEmail(email: String): User? {
        return userRepository.findUserByEmail(email)
    }

    fun findById(id: UUID): User? {
        return userRepository.findById(id).orElse(null)
    }

    fun findAll(): List<User> {
        return userRepository.findAll()
    }

    @Transactional
    fun deleteById(id: UUID) {
        userRepository.findById(id) ?: throw UserNotFoundException("User with id $id not found")
        userRepository.deleteById(id)
    }
}