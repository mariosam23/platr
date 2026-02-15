package com.Platr.api.entity

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "recipe_ingredients")
class RecipeIngredient(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "recipe_ingredient_id")
    var recipeIngredientId: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    var recipe: Recipe,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    var ingredient: Ingredient,

    @Column(nullable = false)
    var quantity: Double,

    @Column(length = 20)
    var unit: String?
)
