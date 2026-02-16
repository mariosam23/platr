package com.Platr.api.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.util.UUID

@Entity
@Table(name = "reviews")
class Review(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "review_id")
    var reviewId: UUID? = null,

    @field:Min(1)
    @field:Max(5)
    var rating: Int,

    @field:NotBlank
    var text: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var owner: User,

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
