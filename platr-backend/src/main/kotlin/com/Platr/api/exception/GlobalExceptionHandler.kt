package com.Platr.api.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException

@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ApiErrorResponse> {
        val message = ex.bindingResult.fieldErrors
            .joinToString(separator = "; ") { "${it.field}: ${it.defaultMessage ?: "Invalid"}" }
            .ifBlank { "Validation failed" }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(buildError(HttpStatus.BAD_REQUEST, message))
    }

    @ExceptionHandler(UserAlreadyExistsException::class)
    fun handleUserConflict(ex: UserAlreadyExistsException): ResponseEntity<ApiErrorResponse> {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(buildError(HttpStatus.CONFLICT, ex.message ?: "Conflict"))
    }

    @ExceptionHandler(UserNotFoundException::class)
    fun handleUserNotFound(ex: UserNotFoundException): ResponseEntity<ApiErrorResponse> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(buildError(HttpStatus.NOT_FOUND, ex.message ?: "Not found"))
    }

    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatus(ex: ResponseStatusException): ResponseEntity<ApiErrorResponse> {
        val statusCode = ex.statusCode.value()
        val reasonPhrase = HttpStatus.resolve(statusCode)?.reasonPhrase ?: "Error"
        return ResponseEntity.status(ex.statusCode)
            .body(
                ApiErrorResponse(
                    status = statusCode,
                    error = reasonPhrase,
                    message = ex.reason ?: reasonPhrase,
                ),
            )
    }

    @ExceptionHandler(RecipeNotFoundException::class)
    fun handleRecipeNotFound(ex: RecipeNotFoundException): ResponseEntity<ApiErrorResponse> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(buildError(HttpStatus.NOT_FOUND, ex.message ?: "Recipe not found"))
    }

    @ExceptionHandler(MealPlanNotFoundException::class)
    fun handleMealPlanNotFound(ex: MealPlanNotFoundException): ResponseEntity<ApiErrorResponse> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(buildError(HttpStatus.NOT_FOUND, ex.message ?: "Meal plan not found"))
    }

    private fun buildError(status: HttpStatus, message: String): ApiErrorResponse {
        return ApiErrorResponse(
            status = status.value(),
            error = status.reasonPhrase,
            message = message,
        )
    }
}
