package com.platr.api.service

import com.platr.api.config.AuthenticatedUserPrincipal
import com.platr.api.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository,
) : UserDetailsService {
    @Transactional(readOnly = true)
    override fun loadUserByUsername(username: String): UserDetails {
        val user =
            userRepository.findUserByEmailWithRoles(username)
                ?: throw UsernameNotFoundException("User with email $username not found")

        return AuthenticatedUserPrincipal(
            id = user.userId ?: throw UsernameNotFoundException("User id missing for email $username"),
            email = user.email,
            passwordHash = user.hashedPassword,
            grantedAuthorities = user.roles.map { SimpleGrantedAuthority("ROLE_${it.name}") },
        )
    }
}
