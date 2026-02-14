package com.Platr.api.entity

import com.Platr.api.enums.Role
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import java.time.Instant

@Entity(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: Long,
    val username: String,
    val email: String,
    val hashedPassword: String,
    val displayedName: String,
    val roles: Set<Role>,
    val createdAt: Instant,
    val updatedAt: Instant,

//    val recipes: List<Recipe>,
//    val mealPlans: List<MealPlan>
)
