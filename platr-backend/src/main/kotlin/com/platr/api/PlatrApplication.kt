package com.platr.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class PlatrApplication

fun main(args: Array<String>) {
    runApplication<PlatrApplication>(*args)
}
