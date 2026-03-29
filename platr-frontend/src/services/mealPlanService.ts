import type { MealPlanItem, MealPlanRequest } from '../application/models/mealPlan';
import { MEAL_PLAN_PAGE_SIZE } from '../application/models/mealPlan';
import { normalizeSpringPage, type SpringPage } from '../application/models/page';
import type { components } from '../types/api';
import { APIEndpoint } from '../utils/constants';
import axiosInstance from './axiosInstance';

function normalizeMealPlan(mealPlan: components['schemas']['MealPlanDto']): MealPlanItem | null {
    if (!mealPlan.mealPlanId || !mealPlan.weekStart || mealPlan.notes == null || mealPlan.ownerUsername == null) {
        return null;
    }

    return {
        mealPlanId: mealPlan.mealPlanId,
        weekStart: mealPlan.weekStart,
        notes: mealPlan.notes,
        ownerId: mealPlan.ownerId ?? null,
        ownerUsername: mealPlan.ownerUsername,
        recipes:
            mealPlan.recipes?.flatMap((recipe) =>
                recipe.recipeId && recipe.recipeTitle && recipe.mealType && recipe.dayOfWeek
                    ? [{
                        mealPlanRecipeId: recipe.mealPlanRecipeId ?? null,
                        recipeId: recipe.recipeId,
                        recipeTitle: recipe.recipeTitle,
                        mealType: recipe.mealType,
                        dayOfWeek: recipe.dayOfWeek,
                    }]
                    : [],
            ) ?? [],
        createdAt: mealPlan.createdAt ?? null,
        updatedAt: mealPlan.updatedAt ?? null,
    };
}

export async function fetchMealPlans(page: number): Promise<SpringPage<MealPlanItem>> {
    const { data } = await axiosInstance.get<components['schemas']['PageMealPlanDto']>(APIEndpoint.MEALPLANS, {
        params: { page, size: MEAL_PLAN_PAGE_SIZE },
    });
    return normalizeSpringPage(data, normalizeMealPlan, page, MEAL_PLAN_PAGE_SIZE);
}

export async function fetchMealPlanDetail(id: string): Promise<MealPlanItem> {
    const { data } = await axiosInstance.get<components['schemas']['MealPlanDto']>(`${APIEndpoint.MEALPLANS}/${id}`);
    const normalized = normalizeMealPlan(data);

    if (!normalized) {
        throw new Error('Meal plan response did not include all required fields.');
    }

    return normalized;
}

export async function createMealPlan(body: MealPlanRequest): Promise<MealPlanItem> {
    const { data } = await axiosInstance.post<components['schemas']['MealPlanDto']>(APIEndpoint.MEALPLANS, body);
    const normalized = normalizeMealPlan(data);

    if (!normalized) {
        throw new Error('Meal plan response did not include all required fields.');
    }

    return normalized;
}

export async function updateMealPlan(id: string, body: MealPlanRequest): Promise<MealPlanItem> {
    const { data } = await axiosInstance.put<components['schemas']['MealPlanDto']>(`${APIEndpoint.MEALPLANS}/${id}`, body);
    const normalized = normalizeMealPlan(data);

    if (!normalized) {
        throw new Error('Meal plan response did not include all required fields.');
    }

    return normalized;
}

export async function deleteMealPlan(id: string): Promise<void> {
    await axiosInstance.delete(`${APIEndpoint.MEALPLANS}/${id}`);
}