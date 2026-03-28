import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFieldArray, useForm, useWatch, type Resolver } from 'react-hook-form';
import type {
    CategoryOption,
    RecipeDetailItem,
    RecipeFormValues,
    RecipeRequest,
} from '../../application/models/recipe';
import {
    createRecipeFormValues,
    DIFFICULTY_OPTIONS,
    recipeFormSchema,
    toRecipeRequest,
} from '../../application/models/recipe';
import { searchIngredients } from '../../services/recipeService';
import { errorTextStyle, inputStyle, labelStyle, modalBaseStyle, overlayStyle } from './recipeStyles';

interface RecipeFormModalProps {
    categories: CategoryOption[];
    initial?: RecipeDetailItem | null;
    onClose: () => void;
    onSave: (data: RecipeRequest) => void;
    isLoading: boolean;
}

export const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
    categories,
    initial,
    onClose,
    onSave,
    isLoading,
}) => {
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(ingredientSearch.trim());
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [ingredientSearch]);

    const { data: ingredientResults = [] } = useQuery({
        queryKey: ['ingredients', debouncedSearch],
        queryFn: () => searchIngredients(debouncedSearch),
        enabled: showIngredientDropdown && debouncedSearch.length > 0,
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<RecipeFormValues>({
        resolver: yupResolver(recipeFormSchema) as Resolver<RecipeFormValues>,
        defaultValues: createRecipeFormValues(initial, categories),
    });

    useEffect(() => {
        reset(createRecipeFormValues(initial, categories));
    }, [categories, initial, reset]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'ingredients',
    });
    const watchedIngredients = useWatch({ control, name: 'ingredients' }) ?? [];

    const addIngredient = (ingredientId: string, name: string, unitHint: string | null) => {
        if (watchedIngredients.some((ingredient) => ingredient.ingredientId === ingredientId)) {
            return;
        }

        append({
            ingredientId,
            quantity: null,
            unit: unitHint ?? '',
            displayName: name,
        });
        setIngredientSearch('');
        setDebouncedSearch('');
        setShowIngredientDropdown(false);
    };

    const submit = (values: RecipeFormValues) => {
        onSave(toRecipeRequest(values));
    };

    return (
        <div style={overlayStyle} role="dialog" aria-modal="true" aria-label={initial ? 'Edit recipe' : 'Add recipe'}>
            <div
                style={{
                    ...modalBaseStyle,
                    maxWidth: 580,
                    overflowY: 'auto',
                    maxHeight: '90vh',
                }}
            >
                <h2 style={{ margin: '0 0 1.5rem' }}>{initial ? 'Edit Recipe' : 'Add Recipe'}</h2>

                <form onSubmit={handleSubmit(submit)}>
                    <label style={labelStyle} htmlFor="recipe-title">
                        Title *
                    </label>
                    <input id="recipe-title" style={inputStyle} {...register('title')} />
                    {errors.title ? <span style={errorTextStyle}>{errors.title.message}</span> : null}

                    <label style={labelStyle} htmlFor="recipe-description">
                        Description *
                    </label>
                    <textarea
                        id="recipe-description"
                        style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                        {...register('description')}
                    />
                    {errors.description ? <span style={errorTextStyle}>{errors.description.message}</span> : null}

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.75rem',
                        }}
                    >
                        <div>
                            <label style={labelStyle} htmlFor="recipe-prep-time">
                                Prep Time (mins) *
                            </label>
                            <input
                                id="recipe-prep-time"
                                type="number"
                                min={1}
                                style={inputStyle}
                                {...register('prepTimeMinutes')}
                            />
                            {errors.prepTimeMinutes ? (
                                <span style={errorTextStyle}>{errors.prepTimeMinutes.message}</span>
                            ) : null}
                        </div>
                        <div>
                            <label style={labelStyle} htmlFor="recipe-calories">
                                Calories
                            </label>
                            <input
                                id="recipe-calories"
                                type="number"
                                min={0}
                                style={inputStyle}
                                {...register('calories')}
                            />
                            {errors.calories ? (
                                <span style={errorTextStyle}>{errors.calories.message}</span>
                            ) : null}
                        </div>
                    </div>

                    <label style={labelStyle} htmlFor="recipe-difficulty">
                        Difficulty *
                    </label>
                    <select id="recipe-difficulty" style={inputStyle} {...register('difficulty')}>
                        {DIFFICULTY_OPTIONS.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                                {difficulty}
                            </option>
                        ))}
                    </select>
                    {errors.difficulty ? <span style={errorTextStyle}>{errors.difficulty.message}</span> : null}

                    <label style={labelStyle} htmlFor="recipe-image-url">
                        Image URL
                    </label>
                    <input id="recipe-image-url" style={inputStyle} {...register('imageUrl')} />
                    {errors.imageUrl ? <span style={errorTextStyle}>{errors.imageUrl.message}</span> : null}

                    <label style={labelStyle}>Categories</label>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            marginBottom: '1rem',
                        }}
                    >
                        {categories.map((category) => (
                            <label
                                key={category.categoryId}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                }}
                            >
                                <input type="checkbox" value={category.categoryId} {...register('categoryIds')} />
                                {category.categoryType}
                            </label>
                        ))}
                    </div>

                    <label style={labelStyle} htmlFor="ingredient-search">
                        Ingredients
                    </label>
                    <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                        <input
                            id="ingredient-search"
                            style={{ ...inputStyle, marginBottom: 0 }}
                            placeholder="Search ingredients by name..."
                            value={ingredientSearch}
                            onChange={(event) => {
                                setIngredientSearch(event.target.value);
                                setShowIngredientDropdown(true);
                            }}
                            onFocus={() => setShowIngredientDropdown(true)}
                            onBlur={() => {
                                window.setTimeout(() => setShowIngredientDropdown(false), 200);
                            }}
                        />
                        {showIngredientDropdown && debouncedSearch.length > 0 ? (
                            ingredientResults.length > 0 ? (
                                <ul
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: '#2a2a2a',
                                        border: '1px solid #444',
                                        borderRadius: 6,
                                        margin: 0,
                                        padding: 0,
                                        listStyle: 'none',
                                        maxHeight: 180,
                                        overflowY: 'auto',
                                        zIndex: 10,
                                    }}
                                >
                                    {ingredientResults.map((ingredient) => (
                                        <li
                                            key={ingredient.ingredientId}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                            }}
                                            onMouseDown={() =>
                                                addIngredient(ingredient.ingredientId, ingredient.name, ingredient.unitHint)
                                            }
                                        >
                                            {ingredient.name}
                                            {ingredient.unitHint ? (
                                                <span style={{ opacity: 0.5, marginLeft: '0.5rem' }}>
                                                    ({ingredient.unitHint})
                                                </span>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: '#2a2a2a',
                                        border: '1px solid #444',
                                        borderRadius: 6,
                                        padding: '0.75rem',
                                        fontSize: '0.85rem',
                                        opacity: 0.7,
                                        zIndex: 10,
                                    }}
                                >
                                    No ingredients match your search.
                                </div>
                            )
                        ) : null}
                    </div>

                    {typeof errors.ingredients?.message === 'string' ? (
                        <span style={errorTextStyle}>{errors.ingredients.message}</span>
                    ) : null}

                    {fields.length === 0 ? (
                        <p style={{ opacity: 0.45, fontSize: '0.85rem', margin: '0 0 0.75rem' }}>
                            No ingredients added yet.
                        </p>
                    ) : null}

                    {fields.map((field, index) => (
                        <div key={field.id} style={{ marginBottom: '0.75rem' }}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr auto',
                                    gap: '0.5rem',
                                    alignItems: 'center',
                                }}
                            >
                                <span style={{ fontSize: '0.9rem', paddingLeft: '0.25rem' }}>
                                    {field.displayName ?? field.ingredientId}
                                </span>
                                <input
                                    type="number"
                                    placeholder="Qty *"
                                    step="any"
                                    min={0}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    {...register(`ingredients.${index}.quantity`)}
                                />
                                <input
                                    placeholder="Unit"
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    {...register(`ingredients.${index}.unit`)}
                                />
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    style={{
                                        padding: '0.45rem 0.65rem',
                                        borderColor: '#ef4444',
                                        color: '#f87171',
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                            {errors.ingredients?.[index]?.quantity ? (
                                <span style={{ ...errorTextStyle, marginTop: '0.25rem' }}>
                                    {errors.ingredients[index]?.quantity?.message}
                                </span>
                            ) : null}
                            {errors.ingredients?.[index]?.ingredientId ? (
                                <span style={{ ...errorTextStyle, marginTop: '0.25rem' }}>
                                    {errors.ingredients[index]?.ingredientId?.message}
                                </span>
                            ) : null}
                        </div>
                    ))}

                    <div
                        style={{
                            display: 'flex',
                            gap: '0.75rem',
                            justifyContent: 'flex-end',
                            marginTop: '1.25rem',
                        }}
                    >
                        {Object.keys(errors).length > 0 ? (
                            <div style={{ color: '#ff6b6b', marginRight: 'auto' }}>Please fix the form errors.</div>
                        ) : null}
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
                            {isLoading ? 'Saving...' : 'Save Recipe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};