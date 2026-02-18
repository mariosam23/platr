package com.Platr.api.entity

import com.Platr.api.enums.RecipeDifficulty
import com.fasterxml.jackson.annotation.JsonBackReference
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
import java.util.UUID

@Entity
@Table(name = "recipes")
class Recipe(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "recipe_id")
    var recipeId: UUID? = null,

    @Column(nullable = false, length = 50)
    var title: String,

    @Column(nullable = false, length = 500)
    var description: String,

    @Column(nullable = false)
    var prepTimeMinutes: Int,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var difficulty: RecipeDifficulty,

    @Column(nullable = false)
    var avgRating: Double,

    var imageUrl: String?,
    var calories: Int?,

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var owner: User,

    @OneToMany(mappedBy = "recipe", cascade = [CascadeType.PERSIST, CascadeType.MERGE], orphanRemoval = true)
    var ingredients: MutableList<RecipeIngredient> = mutableListOf(),

    @OneToMany(mappedBy = "recipe", cascade = [CascadeType.PERSIST, CascadeType.MERGE], orphanRemoval = true)
    var reviews: MutableList<Review> = mutableListOf(),

    @OneToMany(mappedBy = "recipe", cascade = [CascadeType.PERSIST, CascadeType.MERGE], orphanRemoval = true)
    val categories: MutableList<RecipeCategory> = mutableListOf()
) : AuditedEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Recipe) return false
        return recipeId != null && recipeId == other.recipeId
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
