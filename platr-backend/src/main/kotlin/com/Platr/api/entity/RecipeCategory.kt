package com.Platr.api.entity

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "recipe_categories")
class RecipeCategory(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "recipe_category_id")
    var recipeCategoryId: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    var recipe: Recipe,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    var category: Category
) : AuditedEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is RecipeCategory) return false
        return recipeCategoryId != null && recipeCategoryId == other.recipeCategoryId
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
