package com.Platr.api.repository

import com.Platr.api.entity.RecipeIngredient
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface RecipeIngredientRepository : JpaRepository<RecipeIngredient, UUID>
