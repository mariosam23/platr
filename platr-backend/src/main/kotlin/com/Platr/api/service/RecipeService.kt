package com.Platr.api.service

import com.Platr.api.dto.RecipeDetailDto
import com.Platr.api.dto.RecipeRequest
import com.Platr.api.dto.RecipeSummaryDto
import com.Platr.api.dto.toRecipeDetailDto
import com.Platr.api.entity.Recipe
import com.Platr.api.repository.RecipeRepository
import com.Platr.api.entity.RecipeCategory
import com.Platr.api.entity.RecipeIngredient
import com.Platr.api.entity.User
import com.Platr.api.exception.RecipeNotFoundException
import com.Platr.api.exception.UserNotFoundException
import com.Platr.api.repository.CategoryRepository
import com.Platr.api.repository.IngredientRepository
import com.Platr.api.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class RecipeService (
    private val recipeRepository: RecipeRepository,
    private val ingredientRepository: IngredientRepository,
    private val categoryRepository: CategoryRepository,
    private val userRepository: UserRepository
){
    companion object {
        private val logger = LoggerFactory.getLogger(RecipeService::class.java)
    }

    fun createRecipe(request: RecipeRequest, userEmail: String): RecipeSummaryDto {

        val currentUser: User = userRepository.findUserByEmail(userEmail)
            ?: throw UserNotFoundException("User not found with email: $userEmail")

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

        val ingredients = request.ingredients.map { reqIngredient ->
            val ingredientEntity = ingredientRepository.findById(reqIngredient.ingredientId)
                .orElseThrow { RuntimeException("Ingredient not found: ${reqIngredient.ingredientId}") }

            RecipeIngredient(
                recipeIngredientId = null,
                recipe = recipe,
                ingredient = ingredientEntity,
                quantity = reqIngredient.quantity,
                unit = reqIngredient.unit
            )
        }
        recipe.ingredients.addAll(ingredients)

        val categories = request.categoryIds.map { categoryId ->
            val categoryEntity = categoryRepository.findById(categoryId)
                .orElseThrow { RuntimeException("Category not found: $categoryId") }

            RecipeCategory(
                recipeCategoryId = null,
                recipe = recipe,
                category = categoryEntity
            )
        }
        recipe.categories.addAll(categories)

        val savedRecipe = recipeRepository.save(recipe)
        return RecipeSummaryDto.fromEntity(savedRecipe)
    }

    fun searchRecipes(query: String, filters: Map<String, String>, pageable: Pageable): Page<RecipeSummaryDto> {
        // TODO()
    }

    fun getRecipeDetail(recipeId: String): RecipeDetailDto {
        val recipe = recipeRepository.findById(UUID.fromString(recipeId))
            .orElseThrow { RecipeNotFoundException("Recipe not found with id: $recipeId") }

        return recipe.toRecipeDetailDto()
    }
}