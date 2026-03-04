package com.platr.api.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "jwt")
data class JwtConfig(
    val secret: String,
    val accessTokenExpiration: Long,
    val refreshTokenExpiration: Long,
)
