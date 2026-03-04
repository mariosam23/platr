package com.platr.api.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "ingredients")
class Ingredient(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ingredient_id")
    var ingredientId: UUID? = null,
    @Column(nullable = false, length = 50)
    var name: String,
    @Column(length = 20)
    var unitHint: String?,
) : AuditedEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Ingredient) return false
        return ingredientId != null && ingredientId == other.ingredientId
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
