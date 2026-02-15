package com.Platr.api.entity

import com.Platr.api.enums.MealType
import jakarta.persistence.*
import java.time.DayOfWeek
import java.util.UUID

@Entity
@Table(name = "meal_plan_recipes")
class MealPlanRecipe(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "meal_plan_recipe_id")
    var mealPlanRecipeId: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_plan_id", nullable = false)
    var mealPlan: MealPlan,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    var recipe: Recipe,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var mealType: MealType,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var dayOfWeek: DayOfWeek
)
