package com.platr.api.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
class DuplicateMealPlanAssignmentException(
    message: String,
) : RuntimeException(message)