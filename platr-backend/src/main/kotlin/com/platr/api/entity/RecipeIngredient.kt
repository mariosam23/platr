package com.platr.api.entity

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "recipe_ingredients", uniqueConstraints = [UniqueConstraint(columnNames = ["recipe_id", "ingredient_id"])])
class RecipeIngredient(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "recipe_ingredient_id")
    var recipeIngredientId: UUID? = null,
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    var recipe: Recipe,
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    var ingredient: Ingredient,
    @Column(nullable = false)
    var quantity: Double,
    @Column(length = 20)
    var unit: String?,
) : AuditedEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is RecipeIngredient) return false
        return recipeIngredientId != null && recipeIngredientId == other.recipeIngredientId
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
