package com.Platr.api.entity

import com.Platr.api.enums.RecipeDifficulty
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.util.UUID

@Entity
@Table(name = "recipes")
class Recipe(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "recipe_id")
    var recipeId: UUID? = null,

    @field:NotBlank(message = "Title is required")
    @field:Size(max = 50, message = "Title cannot exceed 50 characters")
    var title: String,

    var description: String,

    @field:Positive(message = "Preparation time must be greater than 0")
    var prepTimeMinutes: Int,

    @Enumerated(EnumType.STRING)
    var difficulty: RecipeDifficulty,

    @field:DecimalMax("5.0")
    @field:DecimalMin("0.0")
    var avgRating: Double,

    var imageUrl: String?,
    var calories: Int?,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var owner: User,

    @OneToMany(mappedBy = "recipe", cascade = [CascadeType.ALL], orphanRemoval = true)
    val ingredients: MutableList<RecipeIngredient> = mutableListOf(),

    @OneToMany(mappedBy = "recipe", cascade = [CascadeType.ALL], orphanRemoval = true)
    val reviews: MutableList<Review> = mutableListOf(),

    @OneToMany(mappedBy = "recipe", cascade = [CascadeType.ALL], orphanRemoval = true)
    val categories: MutableList<RecipeCategory> = mutableListOf()
) : AuditedEntity()
