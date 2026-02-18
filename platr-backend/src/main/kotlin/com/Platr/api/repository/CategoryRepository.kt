package com.Platr.api.repository

import com.Platr.api.entity.Category
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface CategoryRepository : JpaRepository<Category, UUID> {
}