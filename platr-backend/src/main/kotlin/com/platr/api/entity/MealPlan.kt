package com.platr.api.entity

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "meal_plans")
class MealPlan(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "meal_plan_id")
    var mealPlanId: UUID? = null,
    @Column(nullable = false)
    var weekStart: LocalDate,
    @Column(nullable = false, length = 1000)
    var notes: String,
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var owner: User,
    @OneToMany(mappedBy = "mealPlan", cascade = [CascadeType.ALL], orphanRemoval = true)
    val mealPlanRecipes: MutableList<MealPlanRecipe> = mutableListOf(),
) : AuditedEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is MealPlan) return false
        return mealPlanId != null && mealPlanId == other.mealPlanId
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
