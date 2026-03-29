import * as yup from 'yup';
import type { components } from '../../types/api';
export { canManage as canManageRecipe } from './page';

export type RecipeDifficulty = components['schemas']['RecipeRequest']['difficulty'];
export type RecipeRequest = components['schemas']['RecipeRequest'];
export type ReviewResponse = components['schemas']['ReviewResponse'];

export interface CategoryOption {
    categoryId: string;
    categoryType: string;
}

export interface IngredientOption {
    ingredientId: string;
    name: string;
    unitHint: string | null;
}

export interface RecipeIngredientItem {
    ingredientId: string;
    ingredientName: string;
    quantity: number | null;
    unit: string | null;
}

export interface RecipeSummaryItem {
    recipeId: string;
    title: string;
    description: string;
    prepTimeMinutes: number | null;
    difficulty: RecipeDifficulty | null;
    avgRating: number | null;
    imageUrl: string | null;
    calories: number | null;
    ownerId: string | null;
    ownerUsername: string | null;
    categoryTypes: string[];
}

export interface RecipeDetailItem extends RecipeSummaryItem {
    ingredients: RecipeIngredientItem[];
    reviews: ReviewResponse[];
    createdAt: string | null;
    updatedAt: string | null;
}

export interface RecipeListFilters {
    page: number;
    search?: string;
    categoryId?: string;
    ingredientIds?: string[];
    size?: number;
}

export interface RecipeFormIngredient {
    ingredientId: string;
    quantity: number | null;
    unit?: string | null;
    displayName?: string;
}

export interface RecipeFormValues {
    title: string;
    description: string;
    prepTimeMinutes: number | null;
    difficulty: RecipeDifficulty;
    imageUrl: string | null;
    calories: number | null;
    ingredients: RecipeFormIngredient[];
    categoryIds: string[];
}

export const RECIPE_PAGE_SIZE = 10;
export const DIFFICULTY_OPTIONS: RecipeDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];

function nullableNumber() {
    return yup
        .number()
        .transform((_, originalValue) => (originalValue === '' || originalValue == null ? null : Number(originalValue)))
        .nullable()
        .optional();
}

const recipeIngredientSchema = yup.object({
    ingredientId: yup.string().trim().required('Ingredient selection is required'),
    quantity: yup
        .number()
        .transform((_, originalValue) => (originalValue === '' || originalValue == null ? NaN : Number(originalValue)))
        .typeError('Quantity is required')
        .required('Quantity is required')
        .min(0.000001, 'Quantity must be positive'),
    unit: yup.string().max(20, 'Max 20 chars').optional(),
    displayName: yup.string().optional(),
});

export const recipeFormSchema = yup.object({
    title: yup.string().trim().required('Title is required').max(50, 'Max 50 characters'),
    description: yup.string().trim().required('Description is required').max(500, 'Max 500 characters'),
    prepTimeMinutes: yup
        .number()
        .transform((_, originalValue) => (originalValue === '' || originalValue == null ? NaN : Number(originalValue)))
        .typeError('Prep time is required')
        .required('Prep time is required')
        .min(1, 'Must be at least 1 minute'),
    difficulty: yup
        .mixed<RecipeDifficulty>()
        .oneOf(DIFFICULTY_OPTIONS)
        .required('Difficulty is required'),
    imageUrl: yup
        .string()
        .url('Must be a valid URL')
        .nullable()
        .optional()
        .transform((value) => (value === '' ? null : value)),
    calories: nullableNumber().min(0, 'Must be positive'),
    ingredients: yup
        .array(recipeIngredientSchema)
        .min(1, 'At least one ingredient is required')
        .required('Ingredients are required'),
    categoryIds: yup.array(yup.string().required()).default([]),
});

export function createRecipeFormValues(
    initial: RecipeDetailItem | null | undefined,
    categories: CategoryOption[],
): RecipeFormValues {
    const selectedCategoryIds = categories
        .filter((category) => initial?.categoryTypes.includes(category.categoryType))
        .map((category) => category.categoryId);

    return {
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        prepTimeMinutes: initial?.prepTimeMinutes ?? null,
        difficulty: initial?.difficulty ?? 'EASY',
        imageUrl: initial?.imageUrl ?? '',
        calories: initial?.calories ?? null,
        ingredients:
            initial?.ingredients.map((ingredient) => ({
                ingredientId: ingredient.ingredientId,
                quantity: ingredient.quantity,
                unit: ingredient.unit ?? '',
                displayName: ingredient.ingredientName,
            })) ?? [],
        categoryIds: selectedCategoryIds,
    };
}

export function toRecipeRequest(values: RecipeFormValues): RecipeRequest {
    return {
        title: values.title.trim(),
        description: values.description.trim(),
        prepTimeMinutes: values.prepTimeMinutes ?? undefined,
        difficulty: values.difficulty,
        imageUrl: values.imageUrl?.trim() ? values.imageUrl.trim() : undefined,
        calories: values.calories ?? undefined,
        ingredients: values.ingredients.map((ingredient) => ({
            ingredientId: ingredient.ingredientId.trim(),
            quantity: ingredient.quantity ?? 0,
            unit: ingredient.unit?.trim() || undefined,
        })),
        categoryIds: values.categoryIds,
    };
}
