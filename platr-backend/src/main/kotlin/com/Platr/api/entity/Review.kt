package com.Platr.api.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import java.time.Instant

@Entity(name = "reviews")
data class Review(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: Long,
    val rating: Int,
    val text: String,
    val createdAt: Instant,

//    val author: User,
//    val recipe: Recipe
)
