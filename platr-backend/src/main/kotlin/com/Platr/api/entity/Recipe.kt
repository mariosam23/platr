package com.Platr.api.entity

import com.Platr.api.enums.RecipeDifficulty
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import java.time.Instant
import java.util.UUID

@Entity(name = "recipes")
data class Recipe(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID,
    val title: String,
    val description: String,
    val prepTimeMinutes: Int,
    val difficulty: RecipeDifficulty,
    val avgRating: Double,
    val imageUrl: String?,
    val calories: Int?,
    val createdAt: Instant,
    val updatedAt: Instant,

    @ManyToOne
    @JoinColumn(name = "uid", nullable = false)
    val owner: User,
//    val categories: List<Category>,
//    val ingredients: List<Ingredient>,
//    val reviews: List<Review>,
)
