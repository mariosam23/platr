import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { canManageRecipe } from '../application/models/recipe';
import { PlatrRoutes } from '../application/routes';
import { useAppSelector } from '../hooks/useAppStore';
import { ConfirmModal } from '../presentation/recipes/ConfirmModal';
import { RecipeFormModal } from '../presentation/recipes/RecipeFormModal';
import { difficultyBadgeStyle, modalBaseStyle, overlayStyle } from '../presentation/recipes/recipeStyles';
import {
    deleteRecipe,
    fetchCategories,
    fetchRecipeDetail,
    updateRecipe,
} from '../services/recipeService';
import '../styles/App.css';
import { getApiErrorMessage } from '../utils/apiErrors';
import { formatDate } from '../utils/formatDate';

export const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const recipeId = id ?? '';
    const navigate = useNavigate();
    const qc = useQueryClient();
    const user = useAppSelector((state) => state.auth.user);

    const [pageError, setPageError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const { data: recipe, isLoading, isError } = useQuery({
        queryKey: ['recipeDetail', recipeId],
        queryFn: () => fetchRecipeDetail(recipeId),
        enabled: Boolean(id),
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: Infinity,
        enabled: isEditing,
    });

    const updateMut = useMutation({
        mutationFn: (body: NonNullable<Parameters<typeof updateRecipe>[1]>) => updateRecipe(recipeId, body),
        onSuccess: async () => {
            setPageError(null);
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['recipes'] }),
                qc.invalidateQueries({ queryKey: ['recipeDetail', recipeId] }),
            ]);
            setIsEditing(false);
        },
        onError: (error) => {
            setPageError(getApiErrorMessage(error, 'Failed to update recipe.'));
        },
    });

    const deleteMut = useMutation({
        mutationFn: () => deleteRecipe(recipeId),
        onSuccess: async () => {
            setPageError(null);
            await qc.invalidateQueries({ queryKey: ['recipes'] });
            navigate(PlatrRoutes.Recipes);
        },
        onError: (error) => {
            setPageError(getApiErrorMessage(error, 'Failed to delete recipe.'));
        },
    });

    if (!id) {
        return <Navigate to={PlatrRoutes.Recipes} replace />;
    }

    if (isLoading) {
        return <div className="page"><p>Loading recipe...</p></div>;
    }

    if (isError || !recipe) {
        return (
            <div className="page">
                <p style={{ color: '#ff6b6b' }}>Failed to load recipe details.</p>
                <Link to={PlatrRoutes.Recipes}>Back to recipes</Link>
            </div>
        );
    }

    const canManage = canManageRecipe(recipe, user);
    const hasReviewedRecipe = Boolean(user?.userId && recipe.reviews.some((review) => review.ownerId === user.userId));

    return (
        <div className="page">
            <div style={{ marginBottom: '1.5rem' }}>
                <Link to={PlatrRoutes.Recipes}>Back to recipes</Link>
            </div>

            {pageError ? (
                <p role="alert" style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
                    {pageError}
                </p>
            ) : null}

            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: recipe.imageUrl ? 'minmax(0, 1.5fr) minmax(280px, 1fr)' : '1fr',
                    gap: '2rem',
                    alignItems: 'start',
                    marginBottom: '2rem',
                }}
            >
                <div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            marginBottom: '1rem',
                        }}
                    >
                        <div>
                            <h1 style={{ margin: '0 0 0.75rem' }}>{recipe.title}</h1>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                <span style={difficultyBadgeStyle(recipe.difficulty)}>{recipe.difficulty ?? '-'}</span>
                                <span>{recipe.prepTimeMinutes != null ? `${recipe.prepTimeMinutes} min` : '-'}</span>
                                <span>{recipe.calories != null ? `${recipe.calories} kcal` : '-'}</span>
                                <span>{recipe.avgRating != null ? `* ${recipe.avgRating.toFixed(1)}` : 'No ratings'}</span>
                            </div>
                            <p style={{ opacity: 0.8, lineHeight: 1.7, margin: 0 }}>{recipe.description}</p>
                        </div>

                        {canManage ? (
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button type="button" onClick={() => setIsEditing(true)}>
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                    style={{
                                        background: '#3a1515',
                                        borderColor: '#ef4444',
                                        color: '#fca5a5',
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <div>
                            <div style={{ opacity: 0.65, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Created by</div>
                            <div>{recipe.ownerUsername ?? 'Unknown user'}</div>
                        </div>
                        <div>
                            <div style={{ opacity: 0.65, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Created</div>
                            <div>{recipe.createdAt ? formatDate(recipe.createdAt) : '-'}</div>
                        </div>
                        <div>
                            <div style={{ opacity: 0.65, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Updated</div>
                            <div>{recipe.updatedAt ? formatDate(recipe.updatedAt) : '-'}</div>
                        </div>
                    </div>

                    <div>
                        <h2 style={{ marginBottom: '0.75rem' }}>Categories</h2>
                        {recipe.categoryTypes.length > 0 ? (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {recipe.categoryTypes.map((category) => (
                                    <span
                                        key={category}
                                        style={{
                                            padding: '0.35rem 0.7rem',
                                            borderRadius: 999,
                                            background: '#1f2937',
                                            border: '1px solid #374151',
                                            fontSize: '0.82rem',
                                        }}
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p style={{ opacity: 0.6 }}>No categories assigned.</p>
                        )}
                    </div>
                </div>

                {recipe.imageUrl ? (
                    <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        style={{
                            width: '100%',
                            borderRadius: 16,
                            border: '1px solid #2a2a2a',
                            objectFit: 'cover',
                            minHeight: 260,
                            background: '#111827',
                        }}
                    />
                ) : null}
            </section>

            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2rem',
                }}
            >
                <div>
                    <h2 style={{ marginBottom: '1rem' }}>Ingredients</h2>
                    {recipe.ingredients.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.9 }}>
                            {recipe.ingredients.map((ingredient) => (
                                <li key={ingredient.ingredientId}>
                                    {ingredient.ingredientName}
                                    {ingredient.quantity != null ? ` - ${ingredient.quantity}` : ''}
                                    {ingredient.unit ? ` ${ingredient.unit}` : ''}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ opacity: 0.6 }}>No ingredients listed.</p>
                    )}
                </div>

                <div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            marginBottom: '1rem',
                        }}
                    >
                        <h2 style={{ margin: 0 }}>Reviews</h2>
                        {user ? (
                            canManage ? (
                                <span style={{ opacity: 0.65 }}>You cannot review your own recipe.</span>
                            ) : hasReviewedRecipe ? (
                                <span style={{ opacity: 0.65 }}>You already reviewed this recipe.</span>
                            ) : (
                                <Link to={`${PlatrRoutes.Feedback}?recipeId=${recipe.recipeId}`}>Write a review</Link>
                            )
                        ) : (
                            <Link to={PlatrRoutes.Login}>Log in to review</Link>
                        )}
                    </div>
                    {recipe.reviews.length > 0 ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {recipe.reviews.map((review) => (
                                <article
                                    key={review.reviewId}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: 12,
                                        border: '1px solid #2a2a2a',
                                        background: '#121212',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: '1rem',
                                            marginBottom: '0.5rem',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <strong>{review.ownerUsername ?? 'Anonymous'}</strong>
                                        <span>
                                            {review.rating != null ? `* ${review.rating}/5` : '-'}
                                            {review.createdAt ? ` • ${formatDate(review.createdAt)}` : ''}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.7 }}>{review.text ?? ''}</p>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p style={{ opacity: 0.6 }}>No reviews yet.</p>
                    )}
                </div>
            </section>

            {isEditing ? (
                <RecipeFormModal
                    categories={categories}
                    initial={recipe}
                    onClose={() => setIsEditing(false)}
                    onSave={(body) => updateMut.mutate(body)}
                    isLoading={updateMut.isPending}
                />
            ) : null}

            {isDeleteConfirmOpen ? (
                <ConfirmModal
                    message={`Are you sure you want to delete "${recipe.title}"?`}
                    onConfirm={() => deleteMut.mutate()}
                    onCancel={() => setIsDeleteConfirmOpen(false)}
                    isLoading={deleteMut.isPending}
                />
            ) : null}

            {updateMut.isPending ? (
                <div style={overlayStyle}>
                    <div style={modalBaseStyle}>
                        <p>Saving recipe changes...</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
};