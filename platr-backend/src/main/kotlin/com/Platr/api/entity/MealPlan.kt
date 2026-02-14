package com.Platr.api.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import java.time.Instant
import java.time.LocalDate

@Entity(name = "meal_plans")
data class MealPlan(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: Long,
    val weekStart: LocalDate,
    val notes: String,
    val createdAt: Instant,
    val updatedAt: Instant,

//    val owner: User,
//    val recipes: List<Recipe>,
)
