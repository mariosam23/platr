package com.Platr.api.config

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.UUID

data class AuthenticatedUserPrincipal(
    val id: UUID,
    private val email: String,
    private val passwordHash: String,
    private val grantedAuthorities: Collection<GrantedAuthority>,
) : UserDetails {
    override fun getAuthorities(): Collection<GrantedAuthority> = grantedAuthorities

    override fun getPassword(): String = passwordHash

    override fun getUsername(): String = email
}