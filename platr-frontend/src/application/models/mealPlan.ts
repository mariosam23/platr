import * as yup from 'yup';
import type { SpringPage } from './page';
import type { components } from '../../types/api';

export type DayOfWeek = components['schemas']['MealPlanRecipeAssignmentRequest']['dayOfWeek'];
export type MealType = components['schemas']['MealPlanRecipeAssignmentRequest']['mealType'];
export type MealPlanRequest = components['schemas']['MealPlanRequest'];

export interface MealPlanAssignmentItem {
    mealPlanRecipeId: string | null;
    recipeId: string;
    recipeTitle: string;
    mealType: MealType;
    dayOfWeek: DayOfWeek;
}

export interface MealPlanItem {
    mealPlanId: string;
    weekStart: string;
    notes: string;
    ownerId: string | null;
    ownerUsername: string;
    recipes: MealPlanAssignmentItem[];
    createdAt: string | null;
    updatedAt: string | null;
}

export interface MealPlanPage extends SpringPage<MealPlanItem> {}

export interface MealPlanFormAssignment {
    recipeId: string;
    mealType: MealType;
    dayOfWeek: DayOfWeek;
}

export interface MealPlanFormValues {
    weekStart: string;
    notes: string;
    assignments: MealPlanFormAssignment[];
}

export const MEAL_PLAN_PAGE_SIZE = 10;
export const MEAL_TYPE_OPTIONS: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
export const DAY_OF_WEEK_OPTIONS: DayOfWeek[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
];

const mealPlanAssignmentSchema = yup.object({
    recipeId: yup.string().trim().required('Recipe is required'),
    mealType: yup.mixed<MealType>().oneOf(MEAL_TYPE_OPTIONS).required('Meal type is required'),
    dayOfWeek: yup.mixed<DayOfWeek>().oneOf(DAY_OF_WEEK_OPTIONS).required('Day of week is required'),
});

export const mealPlanFormSchema = yup.object({
    weekStart: yup.string().required('Week start is required'),
    notes: yup
        .string()
        .trim()
        .required('Notes are required')
        .max(1000, 'Notes must be at most 1000 characters'),
    assignments: yup
        .array(mealPlanAssignmentSchema)
        .min(1, 'At least one recipe assignment is required')
        .test(
            'unique-meal-slot',
            'Each meal type can only be assigned once per day',
            (assignments) => {
                if (!assignments) {
                    return true;
                }

                const seenSlots = new Set<string>();

                for (const assignment of assignments) {
                    const slotKey = `${assignment.mealType}:${assignment.dayOfWeek}`;
                    if (seenSlots.has(slotKey)) {
                        return false;
                    }
                    seenSlots.add(slotKey);
                }

                return true;
            },
        )
        .required('Assignments are required'),
});

export function createMealPlanFormValues(initial: MealPlanItem | null | undefined): MealPlanFormValues {
    return {
        weekStart: initial?.weekStart ?? '',
        notes: initial?.notes ?? '',
        assignments:
            initial?.recipes.map((recipe) => ({
                recipeId: recipe.recipeId,
                mealType: recipe.mealType,
                dayOfWeek: recipe.dayOfWeek,
            })) ?? [{ recipeId: '', mealType: 'BREAKFAST', dayOfWeek: 'MONDAY' }],
    };
}

export function toMealPlanRequest(values: MealPlanFormValues): MealPlanRequest {
    return {
        weekStart: values.weekStart,
        notes: values.notes.trim(),
        assignments: values.assignments.map((assignment) => ({
            recipeId: assignment.recipeId,
            mealType: assignment.mealType,
            dayOfWeek: assignment.dayOfWeek,
        })),
    };
}

export function canManageMealPlan(
    mealPlan: MealPlanItem,
    actor: { userId?: string | null; displayName?: string | null } | null,
): boolean {
    if (!actor) {
        return false;
    }

    if (actor.userId && mealPlan.ownerId) {
        return actor.userId === mealPlan.ownerId;
    }

    if (actor.displayName && mealPlan.ownerUsername) {
        return actor.displayName === mealPlan.ownerUsername;
    }

    return false;
}