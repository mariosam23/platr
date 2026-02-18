package com.Platr.api.repository

import com.Platr.api.entity.Review
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ReviewRepository : JpaRepository<Review, UUID> {
}