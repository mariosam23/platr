import type {
    CategoryOption,
    IngredientOption,
    RecipeDetailItem,
    RecipeListFilters,
    ReviewResponse,
    RecipeRequest,
    RecipeSummaryItem,
} from '../application/models/recipe';
import { RECIPE_PAGE_SIZE } from '../application/models/recipe';
import { normalizeSpringPage, type SpringPage } from '../application/models/page';
import type { ReviewRequest } from '../application/models/review';
import type { components } from '../types/api';
import { APIEndpoint } from '../utils/constants';
import axiosInstance from './axiosInstance';

function normalizeRecipeSummary(recipe: components['schemas']['RecipeSummaryDto']): RecipeSummaryItem | null {
    if (!recipe.recipeId) return null;

    return {
        recipeId: recipe.recipeId,
        title: recipe.title ?? 'Untitled recipe',
        description: recipe.description ?? '',
        prepTimeMinutes: recipe.prepTimeMinutes ?? null,
        difficulty: recipe.difficulty ?? null,
        avgRating: recipe.avgRating ?? null,
        imageUrl: recipe.imageUrl ?? null,
        calories: recipe.calories ?? null,
        ownerId: recipe.ownerId ?? null,
        ownerUsername: recipe.ownerUsername ?? null,
        categoryTypes: recipe.categoryTypes ?? [],
    };
}

function normalizeRecipeDetail(recipe: components['schemas']['RecipeDetailDto']): RecipeDetailItem {
    const base = normalizeRecipeSummary(recipe);
    if (!base) throw new Error('Recipe response did not include an id.');

    return {
        ...base,
        ingredients:
            recipe.ingredients?.flatMap((ingredient) =>
                ingredient.ingredientId
                    ? [{
                        ingredientId: ingredient.ingredientId,
                        ingredientName: ingredient.ingredientName ?? 'Unknown ingredient',
                        quantity: ingredient.quantity ?? null,
                        unit: ingredient.unit ?? null,
                    }]
                    : [],
            ) ?? [],
        reviews: recipe.reviews ?? [],
        createdAt: recipe.createdAt ?? null,
        updatedAt: recipe.updatedAt ?? null,
    };
}

function normalizeCategories(data: components['schemas']['CategoryDto'][]): CategoryOption[] {
    return data.flatMap((c) =>
        c.categoryId && c.categoryType
            ? [{ categoryId: c.categoryId, categoryType: c.categoryType }]
            : [],
    );
}

function normalizeIngredients(data: components['schemas']['IngredientDto'][]): IngredientOption[] {
    return data.flatMap((i) =>
        i.ingredientId && i.name
            ? [{ ingredientId: i.ingredientId, name: i.name, unitHint: i.unitHint ?? null }]
            : [],
    );
}

export async function fetchRecipes(filters: RecipeListFilters): Promise<SpringPage<RecipeSummaryItem>> {
    const params: Record<string, string | number> = {
        page: filters.page,
        size: filters.size ?? RECIPE_PAGE_SIZE,
    };
    const search = filters.search?.trim();

    if (search) params.search = search;
    if (filters.categoryId) params.category = filters.categoryId;
    if (filters.ingredientIds?.length) params.ingredientIds = filters.ingredientIds.join(',');

    const { data } = await axiosInstance.get<components['schemas']['PageRecipeSummaryDto']>(APIEndpoint.RECIPES, { params });
    return normalizeSpringPage(data, normalizeRecipeSummary, filters.page, RECIPE_PAGE_SIZE);
}

export async function fetchRecipeOptions(limit = 100): Promise<RecipeSummaryItem[]> {
    const page = await fetchRecipes({ page: 0, size: limit });
    return page.content;
}

export async function fetchRecipeDetail(id: string): Promise<RecipeDetailItem> {
    const { data } = await axiosInstance.get<components['schemas']['RecipeDetailDto']>(`${APIEndpoint.RECIPES}/${id}`);
    return normalizeRecipeDetail(data);
}

export async function fetchCategories(): Promise<CategoryOption[]> {
    const { data } = await axiosInstance.get<components['schemas']['CategoryDto'][]>(APIEndpoint.CATEGORIES);
    return normalizeCategories(data);
}

export async function searchIngredients(search: string): Promise<IngredientOption[]> {
    const normalizedSearch = search.trim();
    const { data } = await axiosInstance.get<components['schemas']['IngredientDto'][]>(APIEndpoint.INGREDIENTS, {
        params: normalizedSearch ? { search: normalizedSearch } : {},
    });

    return normalizeIngredients(data);
}

export async function createRecipe(body: RecipeRequest): Promise<RecipeSummaryItem> {
    const { data } = await axiosInstance.post<components['schemas']['RecipeSummaryDto']>(APIEndpoint.RECIPES, body);
    const normalized = normalizeRecipeSummary(data);

    if (!normalized) {
        throw new Error('Recipe response did not include an id.');
    }

    return normalized;
}

export async function updateRecipe(id: string, body: RecipeRequest): Promise<RecipeSummaryItem> {
    const { data } = await axiosInstance.put<components['schemas']['RecipeSummaryDto']>(`${APIEndpoint.RECIPES}/${id}`, body);
    const normalized = normalizeRecipeSummary(data);

    if (!normalized) {
        throw new Error('Recipe response did not include an id.');
    }

    return normalized;
}

export async function deleteRecipe(id: string): Promise<void> {
    await axiosInstance.delete(`${APIEndpoint.RECIPES}/${id}`);
}

export async function addRecipeReview(id: string, body: ReviewRequest): Promise<ReviewResponse> {
    const { data } = await axiosInstance.post<components['schemas']['ReviewResponse']>(`${APIEndpoint.RECIPES}/${id}/reviews`, body);
    return data;
}