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
import { errorTextStyle, inputStyle, labelStyle, modalBaseStyle, overlayStyle } from '../recipes/recipeStyles';

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
        <div style={overlayStyle} role="dialog" aria-modal="true" aria-label={initial ? 'Edit meal plan' : 'Add meal plan'}>
            <div style={{ ...modalBaseStyle, maxWidth: 760, maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ margin: '0 0 1.5rem' }}>{initial ? 'Edit Meal Plan' : 'Add Meal Plan'}</h2>

                <form onSubmit={handleSubmit(submit)}>
                    <label style={labelStyle} htmlFor="mealplan-weekstart">
                        Week Start *
                    </label>
                    <input id="mealplan-weekstart" type="date" style={inputStyle} {...register('weekStart')} />
                    {errors.weekStart ? <span style={errorTextStyle}>{errors.weekStart.message}</span> : null}

                    <label style={labelStyle} htmlFor="mealplan-notes">
                        Notes *
                    </label>
                    <textarea
                        id="mealplan-notes"
                        style={{ ...inputStyle, minHeight: 96, resize: 'vertical' }}
                        {...register('notes')}
                    />
                    {errors.notes ? <span style={errorTextStyle}>{errors.notes.message}</span> : null}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Assignments</label>
                        <button
                            type="button"
                            onClick={() => append({ recipeId: '', mealType: 'BREAKFAST', dayOfWeek: 'MONDAY' })}
                        >
                            + Add Assignment
                        </button>
                    </div>

                    {typeof errors.assignments?.message === 'string' ? (
                        <span style={errorTextStyle}>{errors.assignments.message}</span>
                    ) : null}

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(0, 2fr) 1fr 1fr auto',
                                    gap: '0.75rem',
                                    alignItems: 'start',
                                }}
                            >
                                <div>
                                    <select style={inputStyle} {...register(`assignments.${index}.recipeId`)}>
                                        <option value="">Select recipe</option>
                                        {recipes.map((recipe) => (
                                            <option key={recipe.recipeId} value={recipe.recipeId}>
                                                {recipe.title}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assignments?.[index]?.recipeId ? (
                                        <span style={errorTextStyle}>{errors.assignments[index]?.recipeId?.message}</span>
                                    ) : null}
                                </div>

                                <div>
                                    <select style={inputStyle} {...register(`assignments.${index}.mealType`)}>
                                        {MEAL_TYPE_OPTIONS.map((mealType) => (
                                            <option key={mealType} value={mealType}>
                                                {mealType}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assignments?.[index]?.mealType ? (
                                        <span style={errorTextStyle}>{errors.assignments[index]?.mealType?.message}</span>
                                    ) : null}
                                </div>

                                <div>
                                    <select style={inputStyle} {...register(`assignments.${index}.dayOfWeek`)}>
                                        {DAY_OF_WEEK_OPTIONS.map((dayOfWeek) => (
                                            <option key={dayOfWeek} value={dayOfWeek}>
                                                {dayOfWeek}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assignments?.[index]?.dayOfWeek ? (
                                        <span style={errorTextStyle}>{errors.assignments[index]?.dayOfWeek?.message}</span>
                                    ) : null}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                    style={{
                                        padding: '0.6rem 0.75rem',
                                        borderColor: '#ef4444',
                                        color: '#fca5a5',
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                background: '#4f46e5',
                                color: '#fff',
                                borderColor: '#6366f1',
                            }}
                        >
                            {isLoading ? 'Saving...' : 'Save Meal Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};