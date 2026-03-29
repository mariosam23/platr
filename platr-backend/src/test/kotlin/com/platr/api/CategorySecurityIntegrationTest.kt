package com.platr.api

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.http.HttpStatus
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import kotlin.test.assertEquals

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CategorySecurityIntegrationTest {
    @LocalServerPort
    private var port: Int = 0

    @Test
    fun `get categories is public`() {
        val client = HttpClient.newHttpClient()
        val request =
            HttpRequest
                .newBuilder()
                .uri(URI.create("http://localhost:$port/api/categories"))
                .GET()
                .build()
        val response = client.send(request, HttpResponse.BodyHandlers.ofString())

        assertEquals(HttpStatus.OK.value(), response.statusCode())
    }
}
