import React, { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFieldArray, useForm, type Resolver } from 'react-hook-form';
import type { RecipeSummaryItem } from '../../application/models/recipe';
import type { MealPlanFormValues, MealPlanItem, MealPlanRequest } from '../../application/models/mealPlan';
import {
    createMealPlanFormValues,
    DAY_OF_WEEK_OPTIONS,
    MEAL_TYPE_OPTIONS,
    mealPlanFormSchema,
    toMealPlanRequest,
} from '../../application/models/mealPlan';

interface MealPlanFormModalProps {
    recipes: RecipeSummaryItem[];
    initial?: MealPlanItem | null;
    onClose: () => void;
    onSave: (data: MealPlanRequest) => void;
    isLoading: boolean;
}

export const MealPlanFormModal: React.FC<MealPlanFormModalProps> = ({
    recipes,
    initial,
    onClose,
    onSave,
    isLoading,
}) => {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MealPlanFormValues>({
        resolver: yupResolver(mealPlanFormSchema) as Resolver<MealPlanFormValues>,
        defaultValues: createMealPlanFormValues(initial),
    });

    useEffect(() => {
        reset(createMealPlanFormValues(initial));
    }, [initial, reset]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'assignments',
    });

    const submit = (values: MealPlanFormValues) => {
        onSave(toMealPlanRequest(values));
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={initial ? 'Edit meal plan' : 'Add meal plan'}>
            <div className="modal-dialog modal-dialog--large">
                <h2 className="modal-title">{initial ? 'Edit Meal Plan' : 'Add Meal Plan'}</h2>

                <form className="app-form" onSubmit={handleSubmit(submit)}>
                    <label className="app-field-label" htmlFor="mealplan-weekstart">
                        Week Start *
                    </label>
                    <input id="mealplan-weekstart" type="date" {...register('weekStart')} />
                    {errors.weekStart ? <span className="app-field-error">{errors.weekStart.message}</span> : null}

                    <label className="app-field-label" htmlFor="mealplan-notes">
                        Notes *
                    </label>
                    <textarea id="mealplan-notes" style={{ minHeight: 120 }} {...register('notes')} />
                    {errors.notes ? <span className="app-field-error">{errors.notes.message}</span> : null}

                    <div className="detail-actions">
                        <label className="app-field-label">Assignments</label>
                        <button
                            type="button"
                            className="app-button app-button-subtle"
                            onClick={() => append({ recipeId: '', mealType: 'BREAKFAST', dayOfWeek: 'MONDAY' })}
                        >
                            + Add Assignment
                        </button>
                    </div>

                    {typeof errors.assignments?.message === 'string' ? (
                        <span className="app-field-error">{errors.assignments.message}</span>
                    ) : null}

                    <div className="app-form-stack">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="app-ingredient-row"
                            >
                                <div>
                                    <select {...register(`assignments.${index}.recipeId`)}>
                                        <option value="">Select recipe</option>
                                        {recipes.map((recipe) => (
                                            <option key={recipe.recipeId} value={recipe.recipeId}>
                                                {recipe.title}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assignments?.[index]?.recipeId ? (
                                        <span className="app-field-error">{errors.assignments[index]?.recipeId?.message}</span>
                                    ) : null}
                                </div>

                                <div>
                                    <select {...register(`assignments.${index}.mealType`)}>
                                        {MEAL_TYPE_OPTIONS.map((mealType) => (
                                            <option key={mealType} value={mealType}>
                                                {mealType}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assignments?.[index]?.mealType ? (
                                        <span className="app-field-error">{errors.assignments[index]?.mealType?.message}</span>
                                    ) : null}
                                </div>

                                <div>
                                    <select {...register(`assignments.${index}.dayOfWeek`)}>
                                        {DAY_OF_WEEK_OPTIONS.map((dayOfWeek) => (
                                            <option key={dayOfWeek} value={dayOfWeek}>
                                                {dayOfWeek}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assignments?.[index]?.dayOfWeek ? (
                                        <span className="app-field-error">{errors.assignments[index]?.dayOfWeek?.message}</span>
                                    ) : null}
                                </div>

                                <button
                                    type="button"
                                    className="app-button app-button-danger app-button-small"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="app-button app-button-subtle" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </button>
                        <button type="submit" className="app-button app-button-primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Meal Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};