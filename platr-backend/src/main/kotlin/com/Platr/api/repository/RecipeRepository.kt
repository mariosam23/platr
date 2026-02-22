package com.Platr.api.repository

import com.Platr.api.entity.Recipe
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface RecipeRepository : JpaRepository<Recipe, UUID> {
    @Query("SELECT r FROM Recipe r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    fun findByTitleContainingIgnoreCase(@Param("title") title: String, pageable: Pageable): Page<Recipe>

    @Query("SELECT DISTINCT r FROM Recipe r JOIN r.categories rc WHERE rc.category.categoryId = :categoryId")
    fun findByCategoryId(categoryId: UUID, pageable: Pageable): Page<Recipe>

    fun findByOwnerUserId(ownerUserId: UUID, pageable: Pageable): Page<Recipe>

    fun existsByRecipeIdAndOwnerUserId(recipeId: UUID, ownerUserId: UUID): Boolean

    @Query(
        """
        SELECT DISTINCT r
        FROM Recipe r
        WHERE
            (:hasIngredientFilter = false OR EXISTS (
                SELECT 1
                FROM RecipeIngredient ri
                WHERE ri.recipe = r
                AND ri.ingredient.ingredientId IN :ingredientIds
            ))
            AND
            (:hasCategoryFilter = false OR EXISTS (
                SELECT 1
                FROM RecipeCategory rc
                WHERE rc.recipe = r
                AND rc.category.categoryId IN :categoryIds
            ))
        """,
    )
    fun findByIngredientAndCategoryFilter(
        @Param("ingredientIds") ingredientIds: Set<UUID>,
        @Param("hasIngredientFilter") hasIngredientFilter: Boolean,
        @Param("categoryIds") categoryIds: Set<UUID>,
        @Param("hasCategoryFilter") hasCategoryFilter: Boolean,
        pageable: Pageable,
    ): Page<Recipe>

    @Query(
        """
        SELECT DISTINCT r
        FROM Recipe r
        WHERE (:query = '' OR LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:hasIngredientFilter = false OR EXISTS (
            SELECT 1
            FROM RecipeIngredient ri
            WHERE ri.recipe = r
              AND ri.ingredient.ingredientId IN :ingredientIds
          ))
          AND (:hasCategoryFilter = false OR EXISTS (
            SELECT 1
            FROM RecipeCategory rc
            WHERE rc.recipe = r
              AND rc.category.categoryId IN :categoryIds
          ))
        """,
    )
    fun searchByQueryAndFilters(
        @Param("query") query: String,
        @Param("ingredientIds") ingredientIds: Set<UUID>,
        @Param("hasIngredientFilter") hasIngredientFilter: Boolean,
        @Param("categoryIds") categoryIds: Set<UUID>,
        @Param("hasCategoryFilter") hasCategoryFilter: Boolean,
        pageable: Pageable,
    ): Page<Recipe>
}