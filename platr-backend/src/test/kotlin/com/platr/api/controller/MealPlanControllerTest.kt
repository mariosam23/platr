package com.platr.api.controller

import com.platr.api.dto.request.MealPlanRecipeAssignmentRequest
import com.platr.api.dto.request.MealPlanRequest
import com.platr.api.enums.MealType
import com.platr.api.service.MealPlanService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import java.time.DayOfWeek
import java.time.LocalDate
import java.util.UUID

class MealPlanControllerTest {
    private val mealPlanService: MealPlanService = Mockito.mock(MealPlanService::class.java)
    private val mealPlanController = MealPlanController(mealPlanService)

    @Test
    fun `getMealPlans returns page for authenticated user`() {
        val authentication: Authentication = Mockito.mock(Authentication::class.java)
        val pageable = Pageable.unpaged()
        val page = PageImpl(listOf(ControllerTestFixtures.mealPlanDto()))
        Mockito.`when`(authentication.name).thenReturn("sam@example.com")
        Mockito.`when`(mealPlanService.getUserMealPlans("sam@example.com", pageable)).thenReturn(page)

        val response = mealPlanController.getMealPlans(authentication, pageable)

        assertEquals(page, response)
    }

    @Test
    fun `createMealPlan returns created response`() {
        val authentication: Authentication = Mockito.mock(Authentication::class.java)
        val request =
            MealPlanRequest(
                weekStart = LocalDate.of(2026, 4, 20),
                notes = "Weekly plan",
                assignments =
                    listOf(
                        MealPlanRecipeAssignmentRequest(
                            recipeId = UUID.randomUUID(),
                            mealType = MealType.DINNER,
                            dayOfWeek = DayOfWeek.MONDAY,
                        ),
                    ),
            )
        val mealPlan = ControllerTestFixtures.mealPlanDto()
        Mockito.`when`(authentication.name).thenReturn("sam@example.com")
        Mockito.`when`(mealPlanService.createMealPlan(request, "sam@example.com")).thenReturn(mealPlan)

        val response = mealPlanController.createMealPlan(request, authentication)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        assertEquals(mealPlan, response.body)
    }

    @Test
    fun `deleteMealPlan returns no content`() {
        val mealPlanId = UUID.randomUUID()

        val response = mealPlanController.deleteMealPlan(mealPlanId)

        assertEquals(HttpStatus.NO_CONTENT, response.statusCode)
        Mockito.verify(mealPlanService).deleteMealPlan(mealPlanId)
    }
}
