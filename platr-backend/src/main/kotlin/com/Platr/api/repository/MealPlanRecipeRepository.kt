package com.Platr.api.repository

import com.Platr.api.entity.MealPlanRecipe
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface MealPlanRecipeRepository : JpaRepository<MealPlanRecipe, UUID>
