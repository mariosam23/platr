package com.platr.api.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.MapsId
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "user_profiles")
class UserProfile(
    @Id
    @Column(name = "user_id")
    var id: UUID? = null,
    @Column(name = "bio", length = 1000)
    var bio: String? = null,
    @Column(name = "avatar_url")
    var avatarUrl: String? = null,
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    var user: User,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is UserProfile) return false
        return id != null && id == other.id
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
