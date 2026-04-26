package com.platr.api.service

import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.springframework.test.util.ReflectionTestUtils

class EmailServiceTest {
    @Test
    fun `init leaves client unset when api token is blank`() {
        val emailService = EmailService()
        ReflectionTestUtils.setField(emailService, "apiToken", "")

        emailService.init()

        assertNull(ReflectionTestUtils.getField(emailService, "client"))
    }

    @Test
    fun `sendWelcomeEmail is a no-op when client is not initialized`() {
        val emailService = EmailService()

        assertDoesNotThrow {
            emailService.sendWelcomeEmail("sam@example.com", "sam")
        }
    }
}
