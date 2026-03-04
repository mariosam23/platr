package com.platr.api.repository

import com.platr.api.entity.User
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserRepository : JpaRepository<User, UUID> {
    fun findUserByEmail(email: String): User?

    fun findUserByUsername(username: String): User?

    @EntityGraph(attributePaths = ["roles"])
    @Query("SELECT u FROM User u WHERE u.email = :email")
    fun findUserByEmailWithRoles(
        @Param("email") email: String,
    ): User?

    @EntityGraph(attributePaths = ["roles"])
    @Query("SELECT u FROM User u WHERE u.userId = :id")
    fun findByIdWithRoles(
        @Param("id") id: UUID,
    ): User?

    @EntityGraph(attributePaths = ["roles"])
    @Query("SELECT u FROM User u")
    fun findAllWithRoles(): List<User>
}
