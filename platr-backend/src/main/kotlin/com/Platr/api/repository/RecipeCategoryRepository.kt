package com.Platr.api.repository

import com.Platr.api.entity.RecipeCategory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface RecipeCategoryRepository : JpaRepository<RecipeCategory, UUID>
