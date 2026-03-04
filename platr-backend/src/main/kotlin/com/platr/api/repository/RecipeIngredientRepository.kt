package com.platr.api.repository

import com.platr.api.entity.RecipeIngredient
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface RecipeIngredientRepository : JpaRepository<RecipeIngredient, UUID>
