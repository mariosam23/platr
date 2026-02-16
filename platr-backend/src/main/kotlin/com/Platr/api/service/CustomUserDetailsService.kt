package com.Platr.api.service

import com.Platr.api.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {
    override fun loadUserByUsername(username: String): UserDetails {
        val user = userRepository.findUserByEmail(username)
            ?: throw UsernameNotFoundException("User with email $username not found")

        return org.springframework.security.core.userdetails.User
            .withUsername(username)
            .password(user.hashedPassword)
            .authorities(user.roles.map { SimpleGrantedAuthority("ROLE_${it.name}") })
            .build()
    }
}