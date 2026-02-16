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
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    var userId: UUID? = null,

    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank
    @field:Size(min = 3, max = 50)
    var username: String,

    @Column(nullable = false, unique = true)
    @field:Email(message = "Invalid email format")
    @field:NotBlank
    var email: String,

    var hashedPassword: String,
    var displayedName: String,

    @ElementCollection(targetClass = Role::class, fetch = FetchType.EAGER)
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