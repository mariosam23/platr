package com.Platr.api.entity

import com.Platr.api.enums.Role
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import java.time.Instant
import java.util.UUID

@Entity(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val uid: UUID,
    val username: String,
    val email: String,
    val hashedPassword: String,
    val displayedName: String,
    val roles: Set<Role>,
    val createdAt: Instant,
    val updatedAt: Instant,

    @OneToMany(mappedBy = "owner")
    val recipes: MutableList<Recipe>,
    @OneToMany(mappedBy = "owner")
    val mealPlans: MutableList<MealPlan>
)
