package com.platr.api.entity

import com.platr.api.enums.CategoryType
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "categories")
class Category(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "category_id")
    var categoryId: UUID? = null,
    @Enumerated(EnumType.STRING)
    var categoryType: CategoryType,
    @OneToMany(mappedBy = "category", cascade = [CascadeType.PERSIST, CascadeType.MERGE], orphanRemoval = true)
    val recipes: MutableList<RecipeCategory> = mutableListOf(),
) : AuditedEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Category) return false
        return categoryId != null && categoryId == other.categoryId
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
