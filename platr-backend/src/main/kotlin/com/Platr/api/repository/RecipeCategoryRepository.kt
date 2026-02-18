package com.Platr.api.repository

import com.Platr.api.entity.RecipeCategory
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface RecipeCategoryRepository : JpaRepository<RecipeCategory, UUID>
