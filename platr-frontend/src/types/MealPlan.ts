export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export interface MealPlanRecipeResponse {
    mealPlanRecipeId: string;
    recipeId: string;
    recipeTitle: string;
    mealType: MealType;
    dayOfWeek: DayOfWeek;
}

export interface MealPlanResponse {
    mealPlanId: string;
    weekStart: string; // LocalDate as "YYYY-MM-DD"
    notes: string;
    ownerId: string;
    ownerUsername: string;
    recipes: MealPlanRecipeResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface MealPlanRecipeAssignmentRequest {
    recipeId: string;
    mealType: MealType;
    dayOfWeek: DayOfWeek;
}

export interface MealPlanRequest {
    weekStart: string; // "YYYY-MM-DD"
    notes: string;
    assignments: MealPlanRecipeAssignmentRequest[];
}
