import React, { useState, useMemo } from 'react';
import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosInstance from '../services/axiosInstance';
import type { components } from '../types/api';
import { useAppSelector } from '../hooks/useAppStore';

type RecipeSummary = components['schemas']['RecipeSummaryDto'];
type RecipeRequest = components['schemas']['RecipeRequest'];
type PageDto = components['schemas']['PageRecipeSummaryDto'];

const DIFFICULTY_OPTIONS = ['EASY', 'MEDIUM', 'HARD'] as const;
const CATEGORY_OPTIONS = [
    'VEGAN',
    'ITALIAN',
    'ROMANIAN',
    'INDIAN',
    'CHINESE',
    'JAPANESE',
] as const;
const PAGE_SIZE = 10;

// ── API helpers ───────────────────────────────────────────────────────────────

interface CategoryDto {
    categoryId: string;
    categoryType: string;
}

interface IngredientDto {
    ingredientId: string;
    name: string;
    unitHint: string | null;
}

async function fetchRecipes(page: number, search: string): Promise<PageDto> {
    const params: Record<string, string | number> = { page, size: PAGE_SIZE };
    if (search) params.search = search;
    const { data } = await axiosInstance.get<PageDto>('/api/recipes', { params });
    return data;
}

async function fetchRecipeDetail(id: string): Promise<components['schemas']['RecipeDetailDto']> {
    const { data } = await axiosInstance.get<components['schemas']['RecipeDetailDto']>(`/api/recipes/${id}`);
    return data;
}

async function fetchCategories(): Promise<CategoryDto[]> {
    const { data } = await axiosInstance.get<CategoryDto[]>('/api/categories');
    return data;
}

async function searchIngredients(search: string): Promise<IngredientDto[]> {
    const { data } = await axiosInstance.get<IngredientDto[]>('/api/ingredients', {
        params: search ? { search } : {},
    });
    return data;
}

async function createRecipe(body: RecipeRequest): Promise<RecipeSummary> {
    const { data } = await axiosInstance.post<RecipeSummary>('/api/recipes', body);
    return data;
}

async function updateRecipe(id: string, body: RecipeRequest): Promise<RecipeSummary> {
    const { data } = await axiosInstance.put<RecipeSummary>(`/api/recipes/${id}`, body);
    return data;
}

async function deleteRecipe(id: string): Promise<void> {
    await axiosInstance.delete(`/api/recipes/${id}`);
}

// ── Yup schema ────────────────────────────────────────────────────────────────

function nullableNumber() {
    return yup
        .number()
        .transform((_, orig) => (orig === '' || orig == null ? null : Number(orig)))
        .nullable()
        .optional();
}

const schema = yup.object({
    title: yup.string().required('Title is required').max(50, 'Max 50 characters'),
    description: yup.string().required('Description is required').max(500, 'Max 500 characters'),
    prepTimeMinutes: yup
        .number()
        .transform((_, orig) => (orig === '' || orig == null ? NaN : Number(orig)))
        .required('Prep time is required')
        .min(1, 'Must be at least 1 minute'),
    difficulty: yup
        .string()
        .oneOf([...DIFFICULTY_OPTIONS] as string[])
        .required('Difficulty is required'),
    imageUrl: yup
        .string()
        .url('Must be a valid URL')
        .nullable()
        .optional()
        .transform((v) => (v === '' ? null : v)),
    calories: nullableNumber().min(0, 'Must be positive'),
    ingredients: yup
        .array(
            yup.object({
                ingredientId: yup.string().trim().required('Ingredient selection is required'),
                quantity: yup
                    .number()
                    .transform((_, orig) => (orig === '' || orig == null ? NaN : Number(orig)))
                    .required('Quantity is required')
                    .min(0.000001, 'Quantity must be positive'),
                unit: yup.string().max(20, 'Max 20 chars').optional(),
            })
        )
        .min(1, 'At least one ingredient is required')
        .required('Ingredients are required'),
    categoryIds: yup.array(yup.string().required()).default([]),
});

type FormValues = yup.InferType<typeof schema>;

// ── Shared styles ─────────────────────────────────────────────────────────────

const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
};

const modalBase: React.CSSProperties = {
    background: '#1e1e1e',
    borderRadius: 10,
    padding: '2rem',
    width: '90%',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.75rem',
    borderRadius: 6,
    border: '1px solid #444',
    background: '#2a2a2a',
    color: 'inherit',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.3rem',
    fontSize: '0.875rem',
    opacity: 0.8,
};

const errStyle: React.CSSProperties = {
    color: '#ff6b6b',
    fontSize: '0.78rem',
    display: 'block',
    marginTop: '-0.5rem',
    marginBottom: '0.5rem',
};

const th: React.CSSProperties = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    opacity: 0.65,
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
};

const td: React.CSSProperties = {
    padding: '0.75rem 1rem',
    verticalAlign: 'middle',
};

function difficultyBadge(d?: string): React.CSSProperties {
    const base: React.CSSProperties = {
        display: 'inline-block',
        padding: '0.15rem 0.6rem',
        borderRadius: 12,
        fontSize: '0.77rem',
        fontWeight: 700,
    };
    if (d === 'EASY') return { ...base, background: '#14532d', color: '#86efac' };
    if (d === 'HARD') return { ...base, background: '#450a0a', color: '#fca5a5' };
    return { ...base, background: '#422006', color: '#fcd34d' };
}

// ── ConfirmModal ──────────────────────────────────────────────────────────────

interface ConfirmModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    message,
    onConfirm,
    onCancel,
    isLoading,
}) => (
    <div style={overlay}>
        <div style={{ ...modalBase, maxWidth: 420 }}>
            <p style={{ margin: '0 0 1.5rem', lineHeight: 1.6 }}>{message}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={onCancel} disabled={isLoading}>
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    style={{
                        background: '#7f1d1d',
                        color: '#fca5a5',
                        borderColor: '#ef4444',
                    }}
                >
                    {isLoading ? 'Deleting…' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
);

// ── RecipeFormModal ───────────────────────────────────────────────────────────

interface RecipeFormModalProps {
    initial?: components['schemas']['RecipeDetailDto'] | null;
    onClose: () => void;
    onSave: (data: RecipeRequest) => void;
    isLoading: boolean;
}

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
    initial,
    onClose,
    onSave,
    isLoading,
}) => {
    // Fetch categories from API
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: Infinity,
    });

    // Ingredient search state
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);

    React.useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(ingredientSearch), 300);
        return () => clearTimeout(t);
    }, [ingredientSearch]);

    const { data: ingredientResults = [] } = useQuery({
        queryKey: ['ingredients', debouncedSearch],
        queryFn: () => searchIngredients(debouncedSearch),
        enabled: showIngredientDropdown,
    });

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            title: initial?.title ?? '',
            description: initial?.description ?? '',
            prepTimeMinutes: initial?.prepTimeMinutes ?? ('' as any),
            difficulty: initial?.difficulty ?? 'EASY',
            imageUrl: initial?.imageUrl ?? '',
            calories: initial?.calories ?? null,
            ingredients: initial?.ingredients?.map((i) => ({
                ingredientId: i.ingredientId!,
                quantity: i.quantity ?? ('' as any),
                unit: i.unit,
                _name: i.ingredientName,
            })) ?? [],
            categoryIds: [],
        },
    });

    // Set categoryIds from initial once categories are loaded
    React.useEffect(() => {
        if (initial?.categoryTypes && categories.length > 0) {
            const matchedIds = categories
                .filter((c) => (initial.categoryTypes as string[])?.includes(c.categoryType))
                .map((c) => c.categoryId);
            setValue('categoryIds', matchedIds);
        }
    }, [initial, categories, setValue]);

    const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' });

    const submit = (v: FormValues) => {
        onSave({
            title: v.title,
            description: v.description,
            prepTimeMinutes: v.prepTimeMinutes,
            difficulty: v.difficulty as RecipeRequest['difficulty'],
            imageUrl: v.imageUrl ?? undefined,
            calories: v.calories ?? undefined,
            ingredients: (v.ingredients ?? []).map((i: any) => ({
                ingredientId: i.ingredientId,
                quantity: i.quantity,
                unit: i.unit,
            })),
            categoryIds: v.categoryIds,
        });
    };

    // Track ingredient names for display
    const watchedIngredients = watch('ingredients');

    const addIngredient = (ing: IngredientDto) => {
        const normalizedIngredientId = String(ing.ingredientId ?? '').trim();
        if (!normalizedIngredientId) return;

        // Don't add duplicates
        if (watchedIngredients?.some((wi) => wi.ingredientId === normalizedIngredientId)) return;

        const nextIndex = watchedIngredients?.length ?? 0;
        append({
            ingredientId: normalizedIngredientId,
            quantity: null,
            unit: ing.unitHint ?? '',
            _name: ing.name,
        } as any);
        setValue(`ingredients.${nextIndex}.ingredientId`, normalizedIngredientId, {
            shouldDirty: true,
            shouldTouch: true,
        });
        setIngredientSearch('');
        setShowIngredientDropdown(false);
    };

    return (
        <div style={overlay}>
            <div
                style={{
                    ...modalBase,
                    maxWidth: 580,
                    overflowY: 'auto',
                    maxHeight: '90vh',
                }}
            >
                <h2 style={{ margin: '0 0 1.5rem' }}>
                    {initial ? 'Edit Recipe' : 'Add Recipe'}
                </h2>

                <form onSubmit={handleSubmit(submit, (e) => console.error("Form errors:", e))}>
                    <label style={labelStyle}>Title *</label>
                    <input style={inputStyle} {...register('title')} />
                    {errors.title && <span style={errStyle}>{errors.title.message}</span>}

                    <label style={labelStyle}>Description *</label>
                    <textarea
                        style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                        {...register('description')}
                    />
                    {errors.description && (
                        <span style={errStyle}>{errors.description.message}</span>
                    )}

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.75rem',
                        }}
                    >
                        <div>
                            <label style={labelStyle}>Prep Time (mins) *</label>
                            <input
                                type="number"
                                min={1}
                                style={inputStyle}
                                {...register('prepTimeMinutes')}
                            />
                            {errors.prepTimeMinutes && (
                                <span style={errStyle}>{errors.prepTimeMinutes.message}</span>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Calories</label>
                            <input
                                type="number"
                                min={0}
                                style={inputStyle}
                                {...register('calories')}
                            />
                            {errors.calories && (
                                <span style={errStyle}>{errors.calories.message}</span>
                            )}
                        </div>
                    </div>

                    <label style={labelStyle}>Difficulty *</label>
                    <select style={inputStyle} {...register('difficulty')}>
                        {DIFFICULTY_OPTIONS.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                    {errors.difficulty && (
                        <span style={errStyle}>{errors.difficulty.message}</span>
                    )}

                    <label style={labelStyle}>Image URL</label>
                    <input style={inputStyle} {...register('imageUrl')} />
                    {errors.imageUrl && (
                        <span style={errStyle}>{errors.imageUrl.message}</span>
                    )}

                    <label style={labelStyle}>Categories</label>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            marginBottom: '1rem',
                        }}
                    >
                        {categories.map((cat) => (
                            <label
                                key={cat.categoryId}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    value={cat.categoryId}
                                    {...register('categoryIds')}
                                />
                                {cat.categoryType}
                            </label>
                        ))}
                    </div>

                    <label style={labelStyle}>Ingredients</label>

                    {/* Ingredient search */}
                    <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                        <input
                            style={{ ...inputStyle, marginBottom: 0 }}
                            placeholder="Search ingredients by name…"
                            value={ingredientSearch}
                            onChange={(e) => {
                                setIngredientSearch(e.target.value);
                                setShowIngredientDropdown(true);
                            }}
                            onFocus={() => setShowIngredientDropdown(true)}
                            onBlur={() => {
                                // Delay to allow onMouseDown on list items to fire first
                                setTimeout(() => setShowIngredientDropdown(false), 200);
                            }}
                        />
                        {showIngredientDropdown && ingredientResults.length > 0 && (
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
                                {ingredientResults.map((ing) => (
                                    <li
                                        key={ing.ingredientId}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                        }}
                                        onMouseDown={() => addIngredient(ing)}
                                    >
                                        {ing.name}
                                        {ing.unitHint && (
                                            <span style={{ opacity: 0.5, marginLeft: '0.5rem' }}>
                                                ({ing.unitHint})
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {errors.ingredients && typeof errors.ingredients.message === 'string' && (
                        <span style={errStyle}>{errors.ingredients.message}</span>
                    )}

                    {fields.length === 0 && (
                        <p style={{ opacity: 0.45, fontSize: '0.85rem', margin: '0 0 0.75rem' }}>
                            No ingredients added yet.
                        </p>
                    )}
                    {fields.map((field, idx) => (
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
                                    {(field as any)._name ?? field.ingredientId}
                                </span>
                                <input
                                    type="number"
                                    placeholder="Qty *"
                                    step="any"
                                    min={0}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    {...register(`ingredients.${idx}.quantity`)}
                                />
                                <input
                                    placeholder="Unit"
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    {...register(`ingredients.${idx}.unit`)}
                                />
                                <button
                                    type="button"
                                    onClick={() => remove(idx)}
                                    style={{
                                        padding: '0.45rem 0.65rem',
                                        borderColor: '#ef4444',
                                        color: '#f87171',
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                            {errors.ingredients?.[idx]?.quantity && (
                                <span style={{ ...errStyle, marginTop: '0.25rem' }}>
                                    {errors.ingredients[idx]?.quantity?.message}
                                </span>
                            )}
                            {errors.ingredients?.[idx]?.ingredientId && (
                                <span style={{ ...errStyle, marginTop: '0.25rem' }}>
                                    {errors.ingredients[idx]?.ingredientId?.message}
                                </span>
                            )}
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
                        {Object.keys(errors).length > 0 && (
                            <div style={{ color: 'red', marginRight: 'auto' }}>
                                Please fix the form errors.
                            </div>
                        )}
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
                            {isLoading ? 'Saving…' : 'Save Recipe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Recipes page ──────────────────────────────────────────────────────────────

export const Recipes: React.FC = () => {
    const qc = useQueryClient();
    const user = useAppSelector((state) => state.auth.user);

    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [category, setCategory] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [editTargetId, setEditTargetId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RecipeSummary | null>(null);

    const { data, isLoading, isFetching, isError } = useQuery({
        queryKey: ['recipes', page, search],
        queryFn: () => fetchRecipes(page, search),
        placeholderData: keepPreviousData,
    });

    const { data: editTargetDetail, isFetching: isFetchingEdit } = useQuery({
        queryKey: ['recipeDetail', editTargetId],
        queryFn: () => fetchRecipeDetail(editTargetId!),
        enabled: !!editTargetId,
    });

    const invalidate = () => qc.invalidateQueries({ queryKey: ['recipes'] });

    const createMut = useMutation({
        mutationFn: createRecipe,
        onSuccess: () => {
            invalidate();
            setAddOpen(false);
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || err.message || 'Failed to save recipe');
        }
    });

    const updateMut = useMutation({
        mutationFn: ({ id, body }: { id: string; body: RecipeRequest }) =>
            updateRecipe(id, body),
        onSuccess: () => {
            invalidate();
            setEditTargetId(null);
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || err.message || 'Failed to update recipe');
        }
    });

    const deleteMut = useMutation({
        mutationFn: deleteRecipe,
        onSuccess: () => {
            invalidate();
            setDeleteTarget(null);
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || err.message || 'Failed to delete recipe');
        }
    });

    const allRecipes = data?.content ?? [];
    const recipes = useMemo(
        () =>
            category
                ? allRecipes.filter((r) => r.categoryTypes?.includes(category as any))
                : allRecipes,
        [allRecipes, category],
    );
    const totalPages = data?.totalPages ?? 0;

    const commitSearch = () => {
        setPage(0);
        setSearch(searchInput);
    };

    return (
        <div className="page">
            {/* ── Header ── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                }}
            >
                <h1 style={{ margin: 0 }}>Recipes</h1>
                <button
                    onClick={() => setAddOpen(true)}
                    style={{
                        background: '#4f46e5',
                        color: '#fff',
                        borderColor: '#6366f1',
                    }}
                >
                    + Add Recipe
                </button>
            </div>

            {/* ── Search / filter bar ── */}
            <div
                style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                <input
                    style={{ ...inputStyle, width: 240, marginBottom: 0 }}
                    placeholder="Search recipes…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && commitSearch()}
                />
                <button onClick={commitSearch}>Search</button>
                <select
                    style={{ ...inputStyle, width: 180, marginBottom: 0 }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All categories</option>
                    {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                {(search || category) && (
                    <button
                        onClick={() => {
                            setSearchInput('');
                            setSearch('');
                            setCategory('');
                        }}
                    >
                        Clear
                    </button>
                )}
                {isFetching && !isLoading && (
                    <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>Updating…</span>
                )}
            </div>

            {/* ── Table area ── */}
            {isLoading ? (
                <p>Loading…</p>
            ) : isError ? (
                <p style={{ color: '#ff6b6b' }}>Failed to load recipes.</p>
            ) : (
                <>
                    <div
                        style={{
                            overflowX: 'auto',
                            opacity: isFetching ? 0.6 : 1,
                            transition: 'opacity 0.15s',
                        }}
                    >
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.95rem',
                            }}
                        >
                            <thead>
                                <tr style={{ borderBottom: '2px solid #333' }}>
                                    <th style={th}>Title</th>
                                    <th style={th}>Difficulty</th>
                                    <th style={th}>Prep Time</th>
                                    <th style={th}>Calories</th>
                                    <th style={th}>Rating</th>
                                    <th style={th}>Categories</th>
                                    <th style={th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recipes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: 'center',
                                                padding: '3rem',
                                                opacity: 0.45,
                                            }}
                                        >
                                            No recipes found.
                                        </td>
                                    </tr>
                                ) : (
                                    recipes.map((r) => (
                                        <tr
                                            key={r.recipeId}
                                            style={{ borderBottom: '1px solid #2a2a2a' }}
                                        >
                                            <td style={{ ...td, fontWeight: 500 }}>
                                                {r.title}
                                            </td>
                                            <td style={td}>
                                                <span style={difficultyBadge(r.difficulty)}>
                                                    {r.difficulty ?? '—'}
                                                </span>
                                            </td>
                                            <td style={td}>
                                                {r.prepTimeMinutes != null
                                                    ? `${r.prepTimeMinutes} min`
                                                    : '—'}
                                            </td>
                                            <td style={td}>
                                                {r.calories != null
                                                    ? `${r.calories} kcal`
                                                    : '—'}
                                            </td>
                                            <td style={td}>
                                                {r.avgRating != null
                                                    ? `★ ${r.avgRating.toFixed(1)}`
                                                    : '—'}
                                            </td>
                                            <td style={{ ...td, fontSize: '0.82rem' }}>
                                                {(r.categoryTypes ?? []).length > 0
                                                    ? (r.categoryTypes ?? []).join(', ')
                                                    : '—'}
                                            </td>
                                            <td style={{ ...td, whiteSpace: 'nowrap' }}>
                                                {user?.displayName === r.ownerUsername && (
                                                    <>
                                                        <button
                                                            onClick={() => setEditTargetId(r.recipeId!)}
                                                            style={{
                                                                marginRight: '0.5rem',
                                                                padding: '0.3rem 0.7rem',
                                                                fontSize: '0.82rem',
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(r)}
                                                            style={{
                                                                padding: '0.3rem 0.7rem',
                                                                fontSize: '0.82rem',
                                                                background: '#3a1515',
                                                                borderColor: '#ef4444',
                                                                color: '#fca5a5',
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {totalPages > 1 && (
                        <div
                            style={{
                                display: 'flex',
                                gap: '0.4rem',
                                alignItems: 'center',
                                marginTop: '1.5rem',
                                flexWrap: 'wrap',
                            }}
                        >
                            <button
                                disabled={page === 0}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                ← Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    style={{
                                        minWidth: '2.25rem',
                                        fontWeight: i === page ? 700 : undefined,
                                        borderColor: i === page ? '#6366f1' : undefined,
                                        background: i === page ? '#312e81' : undefined,
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── Add Recipe Modal ── */}
            {addOpen && (
                <RecipeFormModal
                    onClose={() => setAddOpen(false)}
                    onSave={(body) => createMut.mutate(body)}
                    isLoading={createMut.isPending}
                />
            )}

            {/* ── Edit Recipe Modal ── */}
            {editTargetId && (
                isFetchingEdit ? (
                    <div style={overlay}><div style={modalBase}><p>Loading recipe details...</p></div></div>
                ) : editTargetDetail ? (
                    <RecipeFormModal
                        initial={editTargetDetail}
                        onClose={() => setEditTargetId(null)}
                        onSave={(body) =>
                            updateMut.mutate({ id: editTargetId, body })
                        }
                        isLoading={updateMut.isPending}
                    />
                ) : (
                    <div style={overlay}>
                        <div style={modalBase}>
                            <p>Error loading recipe details.</p>
                            <button onClick={() => setEditTargetId(null)}>Close</button>
                        </div>
                    </div>
                )
            )}

            {/* ── Delete Confirm Modal ── */}
            {deleteTarget && (
                <ConfirmModal
                    message={`Are you sure you want to delete "${deleteTarget.title}"?`}
                    onConfirm={() => deleteMut.mutate(deleteTarget.recipeId!)}
                    onCancel={() => setDeleteTarget(null)}
                    isLoading={deleteMut.isPending}
                />
            )}
        </div>
    );
};
