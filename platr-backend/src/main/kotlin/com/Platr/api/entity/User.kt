package com.Platr.api.entity

import com.Platr.api.enums.Role
import jakarta.persistence.CascadeType
import jakarta.persistence.CollectionTable
import jakarta.persistence.Column
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    var userId: UUID? = null,

    @Column(nullable = false, unique = true, length = 50)
    var username: String,

    @Column(nullable = false, unique = true, length = 255)
    var email: String,

    @Column(nullable = false)
    var hashedPassword: String,

    @Column(nullable = false, length = 50)
    var displayedName: String,

    @ElementCollection(targetClass = Role::class, fetch = FetchType.LAZY)
    @CollectionTable(name = "user_roles", joinColumns = [JoinColumn(name = "user_id")])
    @Enumerated(EnumType.STRING)
    var roles: Set<Role>,

    @OneToMany(mappedBy = "owner", cascade = [CascadeType.PERSIST, CascadeType.MERGE], orphanRemoval = true)
    val recipes: MutableList<Recipe> = mutableListOf(),

    @OneToMany(mappedBy = "owner", cascade = [CascadeType.PERSIST, CascadeType.MERGE], orphanRemoval = true)
    val mealPlans: MutableList<MealPlan> = mutableListOf(),

    @OneToMany(mappedBy = "owner", cascade = [CascadeType.PERSIST, CascadeType.MERGE], orphanRemoval = true)
    val reviews: MutableList<Review> = mutableListOf()
) : AuditedEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is User) return false
        return userId != null && userId == other.userId
    }

    override fun hashCode(): Int = javaClass.hashCode()
}