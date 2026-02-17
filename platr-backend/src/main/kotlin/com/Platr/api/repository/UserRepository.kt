package com.Platr.api.repository

import com.Platr.api.entity.User
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserRepository : JpaRepository<User, UUID> {
    fun findUserByEmail(email: String): User?

    @EntityGraph(attributePaths = ["roles"])
    fun findUserByEmailWithRoles(email: String): User?
}