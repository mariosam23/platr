package com.platr.api.entity

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.util.UUID

@Entity
@Table(name = "reviews", uniqueConstraints = [UniqueConstraint(name = "uc_reviews_user_recipe", columnNames = ["user_id", "recipe_id"])])
class Review(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "review_id")
    var reviewId: UUID? = null,
    @Column(nullable = false)
    var rating: Int,
    @Column(nullable = false, length = 1000)
    var text: String,
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var owner: User,
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    var recipe: Recipe,
) : AuditedEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Review) return false
        return reviewId != null && reviewId == other.reviewId
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
