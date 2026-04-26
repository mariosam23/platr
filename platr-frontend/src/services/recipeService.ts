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

export interface UserPostedReviewRow {
    recipeId: string;
    recipeTitle: string;
    review: ReviewResponse;
}

const USER_REVIEWS_DETAIL_CONCURRENCY = 6;

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
    if (items.length === 0) return [];
    const results: R[] = new Array(items.length);
    let nextIndex = 0;

    async function worker() {
        for (;;) {
            const i = nextIndex;
            if (i >= items.length) return;
            nextIndex += 1;
            results[i] = await fn(items[i]);
        }
    }

    const pool = Math.min(concurrency, items.length);
    await Promise.all(Array.from({ length: pool }, () => worker()));
    return results;
}

/** Loads all recipe pages and each recipe detail; filters reviews by owner. For large catalogs, prefer a dedicated API. */
export async function fetchUserPostedReviews(userId: string): Promise<UserPostedReviewRow[]> {
    const trimmed = userId.trim();
    if (!trimmed) return [];

    const summaries: RecipeSummaryItem[] = [];
    let page = 0;
    for (;;) {
        const batch = await fetchRecipes({ page, size: RECIPE_PAGE_SIZE });
        summaries.push(...batch.content);
        if (batch.last || batch.empty) break;
        page += 1;
    }

    const details = await mapWithConcurrency(summaries, USER_REVIEWS_DETAIL_CONCURRENCY, (s) => fetchRecipeDetail(s.recipeId));

    const rows: UserPostedReviewRow[] = [];
    for (const detail of details) {
        for (const review of detail.reviews) {
            if (review.ownerId === trimmed) {
                rows.push({
                    recipeId: detail.recipeId,
                    recipeTitle: detail.title,
                    review,
                });
            }
        }
    }

    rows.sort((a, b) => {
        const ta = a.review.createdAt ? Date.parse(a.review.createdAt) : 0;
        const tb = b.review.createdAt ? Date.parse(b.review.createdAt) : 0;
        return tb - ta;
    });

    return rows;
}