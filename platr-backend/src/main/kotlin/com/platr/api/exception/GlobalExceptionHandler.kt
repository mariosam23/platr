package com.platr.api.exception

import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException

@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ApiErrorResponse> {
        val message =
            ex.bindingResult.fieldErrors
                .joinToString(separator = "; ") { "${it.field}: ${it.defaultMessage ?: "Invalid"}" }
                .ifBlank { "Validation failed" }

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(buildError(HttpStatus.BAD_REQUEST, message))
    }

    @ExceptionHandler(UserAlreadyExistsException::class)
    fun handleUserConflict(ex: UserAlreadyExistsException): ResponseEntity<ApiErrorResponse> =
        ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(buildError(HttpStatus.CONFLICT, ex.message ?: "Conflict"))

    @ExceptionHandler(UserNotFoundException::class)
    fun handleUserNotFound(ex: UserNotFoundException): ResponseEntity<ApiErrorResponse> =
        ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(buildError(HttpStatus.NOT_FOUND, ex.message ?: "Not found"))

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentials(ex: BadCredentialsException): ResponseEntity<ApiErrorResponse> =
        ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(buildError(HttpStatus.UNAUTHORIZED, ex.message ?: "Invalid credentials"))

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(ex: AccessDeniedException): ResponseEntity<ApiErrorResponse> =
        ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(buildError(HttpStatus.FORBIDDEN, ex.message ?: "Access denied"))

    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatus(ex: ResponseStatusException): ResponseEntity<ApiErrorResponse> {
        val statusCode = ex.statusCode.value()
        val reasonPhrase = HttpStatus.resolve(statusCode)?.reasonPhrase ?: "Error"
        return ResponseEntity
            .status(ex.statusCode)
            .body(
                ApiErrorResponse(
                    status = statusCode,
                    error = reasonPhrase,
                    message = ex.reason ?: reasonPhrase,
                ),
            )
    }

    @ExceptionHandler(RecipeNotFoundException::class)
    fun handleRecipeNotFound(ex: RecipeNotFoundException): ResponseEntity<ApiErrorResponse> =
        ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(buildError(HttpStatus.NOT_FOUND, ex.message ?: "Recipe not found"))

    @ExceptionHandler(MealPlanNotFoundException::class)
    fun handleMealPlanNotFound(ex: MealPlanNotFoundException): ResponseEntity<ApiErrorResponse> =
        ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(buildError(HttpStatus.NOT_FOUND, ex.message ?: "Meal plan not found"))

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDuplicateKey(ex: DataIntegrityViolationException): ResponseEntity<ApiErrorResponse> =
        ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(buildError(HttpStatus.CONFLICT, "Data integrity violation: ${ex.message}"))

    private fun buildError(
        status: HttpStatus,
        message: String,
    ): ApiErrorResponse =
        ApiErrorResponse(
            status = status.value(),
            error = status.reasonPhrase,
            message = message,
        )
}
