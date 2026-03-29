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
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={initial ? 'Edit recipe' : 'Add recipe'}>
            <div className="modal-dialog modal-dialog--wide">
                <h2 className="modal-title">{initial ? 'Edit Recipe' : 'Add Recipe'}</h2>

                <form className="app-form" onSubmit={handleSubmit(submit)}>
                    <label className="app-field-label" htmlFor="recipe-title">
                        Title *
                    </label>
                    <input id="recipe-title" {...register('title')} />
                    {errors.title ? <span className="app-field-error">{errors.title.message}</span> : null}

                    <label className="app-field-label" htmlFor="recipe-description">
                        Description *
                    </label>
                    <textarea id="recipe-description" style={{ minHeight: 110 }} {...register('description')} />
                    {errors.description ? <span className="app-field-error">{errors.description.message}</span> : null}

                    <div className="app-form-grid">
                        <div>
                            <label className="app-field-label" htmlFor="recipe-prep-time">
                                Prep Time (mins) *
                            </label>
                            <input
                                id="recipe-prep-time"
                                type="number"
                                min={1}
                                {...register('prepTimeMinutes')}
                            />
                            {errors.prepTimeMinutes ? (
                                <span className="app-field-error">{errors.prepTimeMinutes.message}</span>
                            ) : null}
                        </div>
                        <div>
                            <label className="app-field-label" htmlFor="recipe-calories">
                                Calories
                            </label>
                            <input
                                id="recipe-calories"
                                type="number"
                                min={0}
                                {...register('calories')}
                            />
                            {errors.calories ? (
                                <span className="app-field-error">{errors.calories.message}</span>
                            ) : null}
                        </div>
                    </div>

                    <label className="app-field-label" htmlFor="recipe-difficulty">
                        Difficulty *
                    </label>
                    <select id="recipe-difficulty" {...register('difficulty')}>
                        {DIFFICULTY_OPTIONS.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                                {difficulty}
                            </option>
                        ))}
                    </select>
                    {errors.difficulty ? <span className="app-field-error">{errors.difficulty.message}</span> : null}

                    <label className="app-field-label" htmlFor="recipe-image-url">
                        Image URL
                    </label>
                    <input id="recipe-image-url" {...register('imageUrl')} />
                    {errors.imageUrl ? <span className="app-field-error">{errors.imageUrl.message}</span> : null}

                    <label className="app-field-label">Categories</label>
                    <div className="app-checkbox-grid">
                        {categories.map((category) => (
                            <label key={category.categoryId} className="app-checkbox-chip">
                                <input type="checkbox" value={category.categoryId} {...register('categoryIds')} />
                                {category.categoryType}
                            </label>
                        ))}
                    </div>

                    <label className="app-field-label" htmlFor="ingredient-search">
                        Ingredients
                    </label>
                    <div className="app-search-dropdown">
                        <input
                            id="ingredient-search"
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
                                <ul className="app-search-results">
                                    {ingredientResults.map((ingredient) => (
                                        <li
                                            key={ingredient.ingredientId}
                                            className="app-search-result"
                                            onMouseDown={() =>
                                                addIngredient(ingredient.ingredientId, ingredient.name, ingredient.unitHint)
                                            }
                                        >
                                            {ingredient.name}
                                            {ingredient.unitHint ? (
                                                <span className="app-search-result-meta">
                                                    ({ingredient.unitHint})
                                                </span>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="app-search-empty">
                                    No ingredients match your search.
                                </div>
                            )
                        ) : null}
                    </div>

                    {typeof errors.ingredients?.message === 'string' ? (
                        <span className="app-field-error">{errors.ingredients.message}</span>
                    ) : null}

                    {fields.length === 0 ? (
                        <p className="app-help-text">No ingredients added yet.</p>
                    ) : null}

                    {fields.map((field, index) => (
                        <div key={field.id} className="app-ingredient-block">
                            <div className="app-ingredient-row">
                                <span className="app-ingredient-name">
                                    {field.displayName ?? field.ingredientId}
                                </span>
                                <input
                                    type="number"
                                    placeholder="Qty *"
                                    step="any"
                                    min={0}
                                    {...register(`ingredients.${index}.quantity`)}
                                />
                                <input placeholder="Unit" {...register(`ingredients.${index}.unit`)} />
                                <button
                                    type="button"
                                    className="app-button app-button-danger app-button-small"
                                    onClick={() => remove(index)}
                                >
                                    Remove
                                </button>
                            </div>
                            {errors.ingredients?.[index]?.quantity ? (
                                <span className="app-field-error">
                                    {errors.ingredients[index]?.quantity?.message}
                                </span>
                            ) : null}
                            {errors.ingredients?.[index]?.ingredientId ? (
                                <span className="app-field-error">
                                    {errors.ingredients[index]?.ingredientId?.message}
                                </span>
                            ) : null}
                        </div>
                    ))}

                    <div className="modal-actions modal-actions--split">
                        {Object.keys(errors).length > 0 ? (
                            <div className="app-inline-alert">Please fix the form errors.</div>
                        ) : null}
                        <div className="table-action-group">
                            <button type="button" className="app-button app-button-subtle" onClick={onClose} disabled={isLoading}>
                                Cancel
                            </button>
                            <button type="submit" className="app-button app-button-primary" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Recipe'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};