package com.Platr.api.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import java.time.Instant

@Entity(name = "ingredients")
data class Ingredient(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: Long,
    val name: String,
    val unitHint: String?, // ml, g, kg,
    val createdAt: Instant,
    val updatedAt: Instant
)