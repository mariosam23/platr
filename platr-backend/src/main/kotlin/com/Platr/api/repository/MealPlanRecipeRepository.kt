package com.Platr.api.repository

import com.Platr.api.entity.MealPlanRecipe
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface MealPlanRecipeRepository : JpaRepository<MealPlanRecipe, UUID>
