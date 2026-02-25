package com.Platr.api.controller

import com.Platr.api.dto.MealPlanDto
import com.Platr.api.dto.MealPlanRequest
import com.Platr.api.service.MealPlanService
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/mealplans")
class MealPlanController(
    private val mealPlanService: MealPlanService
) {
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun getMealPlans(
        authentication: Authentication,
        pageable: Pageable
    ): Page<MealPlanDto> {
        return mealPlanService.getUserMealPlans(authentication.name, pageable)
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun getMealPlanById(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ResponseEntity<MealPlanDto> {
        val mealPlan = mealPlanService.getMealPlanById(id, authentication.name)
        return ResponseEntity.ok(mealPlan)
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun createMealPlan(
        @Valid @RequestBody request: MealPlanRequest,
        authentication: Authentication
    ): ResponseEntity<MealPlanDto> {
        val createdMealPlan = mealPlanService.createMealPlan(request, authentication.name)
        return ResponseEntity.ok(createdMealPlan)
    }

    @PutMapping("/{id}")
    @PreAuthorize("@mealPlanSecurity.isOwner(authentication, #id) or hasRole('ADMIN')")
    fun updateMealPlan(
        @PathVariable id: UUID,
        @Valid @RequestBody request: MealPlanRequest,
        authentication: Authentication
    ): ResponseEntity<MealPlanDto> {
        val updatedMealPlan = mealPlanService.updateMealPlan(id, request, authentication.name)
        return ResponseEntity.ok(updatedMealPlan)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@mealPlanSecurity.isOwner(authentication, #id) or hasRole('ADMIN')")
    fun deleteMealPlan(@PathVariable id: UUID): ResponseEntity<Void> {
        mealPlanService.deleteMealPlan(id)
        return ResponseEntity.noContent().build()
    }
}