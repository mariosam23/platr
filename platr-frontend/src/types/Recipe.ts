import type { ReviewResponse } from "./Review";

export type RecipeDifficulty = "EASY" | "MEDIUM" | "HARD";
export type CategoryType = "VEGAN" | "ITALIAN" | "ROMANIAN" | "INDIAN" | "CHINESE" | "JAPANESE";

export interface RecipeIngredientResponse {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string | null;
}

export interface RecipeSummaryResponse {
    recipeId: string;
    title: string;
    description: string;
    prepTimeMinutes: number;
    difficulty: RecipeDifficulty;
    avgRating: number;
    imageUrl: string | null;
    calories: number | null;
    ownerId: string;
    ownerUsername: string;
    categoryTypes: CategoryType[];
}

export interface RecipeDetailResponse extends RecipeSummaryResponse {
    ingredients: RecipeIngredientResponse[];
    reviews: ReviewResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface RecipeIngredientRequest {
    ingredientId: string;
    quantity: number;
    unit?: string;
}

export interface RecipeRequest {
    title: string;
    description: string;
    prepTimeMinutes: number;
    difficulty: RecipeDifficulty;
    imageUrl?: string;
    calories?: number;
    ingredients: RecipeIngredientRequest[];
    categoryIds: string[];
}
