package com.Platr.api.repository

import com.Platr.api.entity.MealPlan
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface MealPlanRepository : JpaRepository<MealPlan, UUID> {
    @Query("SELECT mp FROM MealPlan mp WHERE mp.owner.userId = :ownerUserId")
    fun findByOwnerUserId(@Param("ownerUserId") ownerUserId: UUID, pageable: Pageable): Page<MealPlan>
}