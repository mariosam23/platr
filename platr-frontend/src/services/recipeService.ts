import type {
    CategoryOption,
    IngredientOption,
    RecipeDetailItem,
    RecipeListFilters,
    RecipeListPage,
    RecipeRequest,
    RecipeSummaryItem,
} from '../application/models/recipe';
import { APIEndpoint } from '../utils/constants';
import type { components } from '../types/api';
import { RECIPE_PAGE_SIZE } from '../application/models/recipe';
import axiosInstance from './axiosInstance';

function normalizeRecipeSummary(recipe: components['schemas']['RecipeSummaryDto']): RecipeSummaryItem | null {
    if (!recipe.recipeId) {
        return null;
    }

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
    if (!recipe.recipeId) {
        throw new Error('Recipe response did not include an id.');
    }

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
        ingredients:
            recipe.ingredients?.flatMap((ingredient) => {
                if (!ingredient.ingredientId) {
                    return [];
                }

                return [
                    {
                        ingredientId: ingredient.ingredientId,
                        ingredientName: ingredient.ingredientName ?? 'Unknown ingredient',
                        quantity: ingredient.quantity ?? null,
                        unit: ingredient.unit ?? null,
                    },
                ];
            }) ?? [],
        reviews: recipe.reviews ?? [],
        createdAt: recipe.createdAt ?? null,
        updatedAt: recipe.updatedAt ?? null,
    };
}

function normalizeCategories(categories: components['schemas']['CategoryDto'][]): CategoryOption[] {
    return categories.flatMap((category) => {
        if (!category.categoryId || !category.categoryType) {
            return [];
        }

        return [
            {
                categoryId: category.categoryId,
                categoryType: category.categoryType,
            },
        ];
    });
}

function normalizeIngredients(ingredients: components['schemas']['IngredientDto'][]): IngredientOption[] {
    return ingredients.flatMap((ingredient) => {
        if (!ingredient.ingredientId || !ingredient.name) {
            return [];
        }

        return [
            {
                ingredientId: ingredient.ingredientId,
                name: ingredient.name,
                unitHint: ingredient.unitHint ?? null,
            },
        ];
    });
}

function normalizeRecipePage(
    page: components['schemas']['PageRecipeSummaryDto'],
    fallbackPageNumber: number,
): RecipeListPage {
    const content = (page.content ?? []).flatMap((recipe) => {
        const normalized = normalizeRecipeSummary(recipe);
        return normalized ? [normalized] : [];
    });

    return {
        content,
        totalPages: page.totalPages ?? 0,
        totalElements: page.totalElements ?? 0,
        size: page.size ?? RECIPE_PAGE_SIZE,
        number: page.number ?? fallbackPageNumber,
        first: page.first ?? fallbackPageNumber === 0,
        last: page.last ?? false,
        empty: page.empty ?? content.length === 0,
    };
}

export async function fetchRecipes(filters: RecipeListFilters): Promise<RecipeListPage> {
    const params: Record<string, string | number> = {
        page: filters.page,
        size: filters.size ?? RECIPE_PAGE_SIZE,
    };
    const search = filters.search?.trim();

    if (search) {
        params.search = search;
    }

    if (filters.categoryId) {
        params.category = filters.categoryId;
    }

    if (filters.ingredientIds?.length) {
        params.ingredientIds = filters.ingredientIds.join(',');
    }

    const { data } = await axiosInstance.get<components['schemas']['PageRecipeSummaryDto']>(APIEndpoint.RECIPES, { params });
    return normalizeRecipePage(data, filters.page);
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