package com.platr.api.entity

import com.fasterxml.jackson.annotation.JsonBackReference
import com.platr.api.enums.MealType
import jakarta.persistence.*
import java.time.DayOfWeek
import java.util.UUID

@Entity
@Table(name = "meal_plan_recipes", uniqueConstraints = [UniqueConstraint(columnNames = ["meal_plan_id", "meal_type", "day_of_week"])])
class MealPlanRecipe(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "meal_plan_recipe_id")
    var mealPlanRecipeId: UUID? = null,
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_plan_id", nullable = false)
    var mealPlan: MealPlan,
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    var recipe: Recipe,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var mealType: MealType,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var dayOfWeek: DayOfWeek,
) : AuditedEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is MealPlanRecipe) return false
        return mealPlanRecipeId != null && mealPlanRecipeId == other.mealPlanRecipeId
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
