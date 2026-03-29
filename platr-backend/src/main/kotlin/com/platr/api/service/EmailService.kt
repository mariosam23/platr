package com.platr.api.service

import io.mailtrap.client.MailtrapClient
import io.mailtrap.config.MailtrapConfig
import io.mailtrap.factory.MailtrapClientFactory
import io.mailtrap.model.request.emails.Address
import io.mailtrap.model.request.emails.MailtrapMail
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import jakarta.annotation.PostConstruct

@Service
class EmailService {
    companion object {
        private val logger = LoggerFactory.getLogger(EmailService::class.java)
    }

    @Value("\${mailtrap.api.token}")
    private lateinit var apiToken: String

    private var client: MailtrapClient? = null

    @PostConstruct
    fun init() {
        if (apiToken.isBlank()) {
            logger.warn("MailTrap setup is missing. Email service will be disabled.")
            return
        }
        val config =
            MailtrapConfig.Builder()
                .token(apiToken)
                .build()
        client = MailtrapClientFactory.createMailtrapClient(config)
    }

    fun sendWelcomeEmail(to: String, username: String) {
        val mailtrapClient = client
        if (mailtrapClient == null) {
            logger.warn("MailTrap client not initialized. Skipping welcome email to $to")
            return
        }

        try {
            val mail =
                MailtrapMail.builder()
                    .from(Address("hello@demomailtrap.co", "Platr API"))
                    .to(listOf(Address(to)))
                    .subject("Welcome to Platr, $username!")
                    .text("Hello $username,\n\nWelcome to Platr! We're glad to have you on board. Start exploring recipes and creating meal plans today.\n\nBest,\nThe Platr Team")
                    .category("Welcome Email")
                    .build()

            val response = mailtrapClient.send(mail)
            logger.info($$"Welcome email successfully sent to $$to, response: ${response.messageIds}")
        } catch (e: Exception) {
            logger.error("Failed to send welcome email to $to", e)
        }
    }
}
