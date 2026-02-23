package com.Platr.api.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(value = HttpStatus.NOT_FOUND)
class MealPlanNotFoundException(message: String) : RuntimeException(message)
