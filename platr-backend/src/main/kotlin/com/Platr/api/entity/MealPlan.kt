package com.Platr.api.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity(name = "meal_plans")
data class MealPlan(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID,
    val weekStart: LocalDate,
    val notes: String,
    val createdAt: Instant,
    val updatedAt: Instant,

    @ManyToOne
    @JoinColumn(name = "uid", nullable = false)
    val owner: User,
//    val recipes: List<Recipe>,
)
