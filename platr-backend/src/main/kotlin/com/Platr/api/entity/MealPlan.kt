package com.Platr.api.entity

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
import jakarta.validation.constraints.FutureOrPresent
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "meal_plans")
class MealPlan(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "meal_plan_id")
    var mealPlanId: UUID? = null,

    @field:FutureOrPresent
    var weekStart: LocalDate,

    var notes: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var owner: User,

    @OneToMany(mappedBy = "mealPlan", cascade = [CascadeType.ALL], orphanRemoval = true)
    val mealPlanRecipes: MutableList<MealPlanRecipe> = mutableListOf(),
) : AuditedEntity()
