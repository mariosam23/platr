package com.Platr.api.service

import com.Platr.api.dto.RecipeDetailDto
import com.Platr.api.dto.RecipeRequest
import com.Platr.api.dto.RecipeSummaryDto
import com.Platr.api.dto.ReviewRequest
import com.Platr.api.dto.ReviewResponse
import com.Platr.api.dto.toRecipeDetailDto
import com.Platr.api.dto.toReviewResponse
import com.Platr.api.entity.Recipe
import com.Platr.api.entity.RecipeCategory
import com.Platr.api.entity.RecipeIngredient
import com.Platr.api.entity.Review
import com.Platr.api.entity.User
import com.Platr.api.exception.RecipeNotFoundException
import com.Platr.api.exception.UserNotFoundException
import com.Platr.api.repository.CategoryRepository
import com.Platr.api.repository.IngredientRepository
import com.Platr.api.repository.RecipeRepository
import com.Platr.api.repository.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class RecipeService(
    private val recipeRepository: RecipeRepository,
    private val ingredientRepository: IngredientRepository,
    private val categoryRepository: CategoryRepository,
    private val userRepository: UserRepository,
) {
    companion object {
        private val EMPTY_FILTER_SENTINEL = UUID(0L, 0L)
    }

    @Transactional(readOnly = true)
    fun getAllRecipes(pageable: Pageable): Page<RecipeSummaryDto> {
        return recipeRepository.findAll(pageable).map { RecipeSummaryDto.fromEntity(it) }
    }

    @Transactional(readOnly = true)
    fun getRecipesByUser(userEmail: String, pageable: Pageable): Page<RecipeSummaryDto> {
        val user = findUserByEmailOrThrow(userEmail)

        return recipeRepository.findByOwnerUserId(user.userId!!, pageable)
            .map { RecipeSummaryDto.fromEntity(it) }
    }

    @Transactional(readOnly = true)
    fun getRecipesByCategory(categoryId: String, pageable: Pageable): Page<RecipeSummaryDto> {
        val categoryUuid = parseUuid(categoryId, "category")
        return recipeRepository.findByCategoryId(categoryUuid, pageable)
            .map { RecipeSummaryDto.fromEntity(it) }
    }

    @Transactional
    fun createRecipe(request: RecipeRequest, userEmail: String): RecipeSummaryDto {
        val currentUser = findUserByEmailOrThrow(userEmail)

        val recipe = Recipe(
            recipeId = null,
            title = request.title,
            description = request.description,
            prepTimeMinutes = request.prepTimeMinutes,
            difficulty = request.difficulty,
            avgRating = 0.0,
            imageUrl = request.imageUrl,
            calories = request.calories,
            owner = currentUser,
            ingredients = mutableListOf(),
            reviews = mutableListOf(),
            categories = mutableListOf()
        )

        recipe.ingredients.addAll(buildRecipeIngredients(recipe, request))
        recipe.categories.addAll(buildRecipeCategories(recipe, request.categoryIds))

        val savedRecipe = recipeRepository.save(recipe)
        return RecipeSummaryDto.fromEntity(savedRecipe)
    }

    @Transactional
    fun updateRecipe(recipeId: UUID, request: RecipeRequest, userEmail: String): RecipeSummaryDto {
        findUserByEmailOrThrow(userEmail)
        val recipe = findRecipeByIdOrThrow(recipeId)

        recipe.title = request.title
        recipe.description = request.description
        recipe.prepTimeMinutes = request.prepTimeMinutes
        recipe.difficulty = request.difficulty
        recipe.imageUrl = request.imageUrl
        recipe.calories = request.calories

        recipe.ingredients.clear()
        recipe.ingredients.addAll(buildRecipeIngredients(recipe, request))

        recipe.categories.clear()
        recipe.categories.addAll(buildRecipeCategories(recipe, request.categoryIds))

        return RecipeSummaryDto.fromEntity(recipeRepository.save(recipe))
    }

    @Transactional
    fun deleteRecipe(recipeId: String) {
        val recipeUuid = parseUuid(recipeId, "recipe id")
        if (!recipeRepository.existsById(recipeUuid)) {
            throw RecipeNotFoundException("Recipe not found with id: $recipeId")
        }

        recipeRepository.deleteById(recipeUuid)
    }

    @Transactional(readOnly = true)
    fun searchRecipes(query: String, filters: Map<String, String>, pageable: Pageable): Page<RecipeSummaryDto> {
        val normalizedQuery = query.trim()
        val categoryIds = parseUuidCsv(filters["categoryId"] ?: filters["category"], "category")
        val ingredientIds = parseUuidCsv(filters["ingredientIds"], "ingredient")
        val hasCategoryFilter = categoryIds.isNotEmpty()
        val hasIngredientFilter = ingredientIds.isNotEmpty()

        return recipeRepository.searchByQueryAndFilters(
            query = normalizedQuery,
            ingredientIds = ingredientIds.ifEmpty { setOf(EMPTY_FILTER_SENTINEL) },
            hasIngredientFilter = hasIngredientFilter,
            categoryIds = categoryIds.ifEmpty { setOf(EMPTY_FILTER_SENTINEL) },
            hasCategoryFilter = hasCategoryFilter,
            pageable = pageable,
        ).map { RecipeSummaryDto.fromEntity(it) }
    }

    @Transactional
    fun addReview(recipeId: UUID, reviewRequest: ReviewRequest, userEmail: String): ReviewResponse {
        val recipe = findRecipeByIdOrThrow(recipeId)
        val currentUser = findUserByEmailOrThrow(userEmail)
        val currentReviewCount = recipe.reviews.size

        val review = Review(
            reviewId = null,
            rating = reviewRequest.rating,
            text = reviewRequest.text,
            owner = currentUser,
            recipe = recipe,
        )

        recipe.reviews.add(review)
        recipe.avgRating = ((recipe.avgRating * currentReviewCount) + review.rating.toDouble()) / (currentReviewCount + 1)

        recipeRepository.saveAndFlush(recipe)
        return review.toReviewResponse()
    }

    @Transactional(readOnly = true)
    fun getRecipeDetail(recipeId: UUID): RecipeDetailDto {
        return findRecipeByIdOrThrow(recipeId).toRecipeDetailDto()
    }

    private fun buildRecipeIngredients(recipe: Recipe, request: RecipeRequest): List<RecipeIngredient> {
        return request.ingredients
            .distinctBy { it.ingredientId }
            .map { reqIngredient ->
                val ingredientEntity = ingredientRepository.findById(reqIngredient.ingredientId)
                    .orElseThrow {
                        ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Ingredient not found: ${reqIngredient.ingredientId}",
                        )
                    }

                RecipeIngredient(
                    recipeIngredientId = null,
                    recipe = recipe,
                    ingredient = ingredientEntity,
                    quantity = reqIngredient.quantity,
                    unit = reqIngredient.unit,
                )
            }
    }

    private fun buildRecipeCategories(recipe: Recipe, categoryIds: Set<UUID>): List<RecipeCategory> {
        return categoryIds
            .map { categoryId ->
                val categoryEntity = categoryRepository.findById(categoryId)
                    .orElseThrow {
                        ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found: $categoryId")
                    }

                RecipeCategory(
                    recipeCategoryId = null,
                    recipe = recipe,
                    category = categoryEntity,
                )
            }
    }

    private fun findRecipeByIdOrThrow(recipeId: UUID): Recipe {
        return recipeRepository.findById(recipeId)
            .orElseThrow { RecipeNotFoundException("Recipe not found with id: $recipeId") }
    }

    private fun findUserByEmailOrThrow(userEmail: String): User {
        return userRepository.findUserByEmail(userEmail)
            ?: throw UserNotFoundException("User not found with email: $userEmail")
    }

    private fun parseUuidCsv(raw: String?, fieldName: String): Set<UUID> {
        if (raw.isNullOrBlank()) {
            return emptySet()
        }

        return raw.split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .map { parseUuid(it, fieldName) }
            .toSet()
    }

    private fun parseUuid(raw: String, fieldName: String): UUID {
        return runCatching { UUID.fromString(raw) }
            .getOrElse {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid $fieldName: $raw")
            }
    }
}