package com.Platr.api.repository

import com.Platr.api.entity.Ingredient
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface IngredientRepository : JpaRepository<Ingredient, UUID> {
}