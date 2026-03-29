import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { canManageRecipe } from '../application/models/recipe';
import { PlatrRoutes } from '../application/routes';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAppSelector } from '../hooks/useAppStore';
import { RecipeFormModal } from '../presentation/recipes/RecipeFormModal';
import { difficultyBadgeStyle } from '../presentation/recipes/recipeStyles';
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
    const [pageNotice, setPageNotice] = useState<string | null>(null);
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
            setPageNotice('Recipe updated successfully.');
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['recipes'] }),
                qc.invalidateQueries({ queryKey: ['recipeDetail', recipeId] }),
            ]);
            setIsEditing(false);
        },
        onError: (error) => {
            setPageNotice(null);
            setPageError(getApiErrorMessage(error, 'Failed to update recipe.'));
        },
    });

    const deleteMut = useMutation({
        mutationFn: () => deleteRecipe(recipeId),
        onSuccess: async () => {
            setPageError(null);
            setPageNotice(null);
            await qc.invalidateQueries({ queryKey: ['recipes'] });
            navigate(PlatrRoutes.Recipes);
        },
        onError: (error) => {
            setPageNotice(null);
            setPageError(getApiErrorMessage(error, 'Failed to delete recipe.'));
        },
    });

    if (!id) {
        return <Navigate to={PlatrRoutes.Recipes} replace />;
    }

    if (isLoading) {
        return <div className="page"><p className="app-message app-toast">Loading recipe...</p></div>;
    }

    if (isError || !recipe) {
        return (
            <div className="page">
                <p className="app-message app-message-error app-toast">Failed to load recipe details.</p>
                <Link to={PlatrRoutes.Recipes}>Back to recipes</Link>
            </div>
        );
    }

    const canManage = canManageRecipe(recipe, user);
    const hasReviewedRecipe = Boolean(user?.userId && recipe.reviews.some((review) => review.ownerId === user.userId));

    return (
        <div className="page">
            <div>
                <Link className="page-back-link" to={PlatrRoutes.Recipes}>Back to recipes</Link>
            </div>

            {pageError ? (
                <p role="alert" className="app-message app-message-error app-toast">
                    {pageError}
                </p>
            ) : null}

            {pageNotice ? (
                <p role="status" className="app-message app-message-success app-toast">
                    {pageNotice}
                </p>
            ) : null}

            <section
                className="detail-hero"
                style={{
                    display: 'grid',
                    gridTemplateColumns: recipe.imageUrl ? 'minmax(0, 1.5fr) minmax(280px, 1fr)' : '1fr',
                }}
            >
                <div className="detail-panel">
                    <div className="detail-topline" style={{ marginBottom: '1rem' }}>
                        <div>
                            <h1 style={{ margin: '0 0 0.75rem' }}>{recipe.title}</h1>
                            <div className="detail-badges" style={{ marginBottom: '1rem' }}>
                                <span style={difficultyBadgeStyle(recipe.difficulty)}>{recipe.difficulty ?? '-'}</span>
                                <span>{recipe.prepTimeMinutes != null ? `${recipe.prepTimeMinutes} min` : '-'}</span>
                                <span>{recipe.calories != null ? `${recipe.calories} kcal` : '-'}</span>
                                <span>{recipe.avgRating != null ? `* ${recipe.avgRating.toFixed(1)}` : 'No ratings'}</span>
                            </div>
                            <p className="detail-copy">{recipe.description}</p>
                        </div>

                        {canManage ? (
                            <div className="detail-actions">
                                <button type="button" className="app-button" onClick={() => {
                                    setPageNotice(null);
                                    setIsEditing(true);
                                }}>
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="app-button app-button-danger"
                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                >
                                    Delete
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className="detail-meta-grid">
                        <div>
                            <span className="detail-meta-label">Created by</span>
                            <div>{recipe.ownerUsername ?? 'Unknown user'}</div>
                        </div>
                        <div>
                            <span className="detail-meta-label">Created</span>
                            <div>{recipe.createdAt ? formatDate(recipe.createdAt) : '-'}</div>
                        </div>
                        <div>
                            <span className="detail-meta-label">Updated</span>
                            <div>{recipe.updatedAt ? formatDate(recipe.updatedAt) : '-'}</div>
                        </div>
                    </div>

                    <div>
                        <h2 style={{ marginBottom: '0.75rem' }}>Categories</h2>
                        {recipe.categoryTypes.length > 0 ? (
                            <div className="chip-list">
                                {recipe.categoryTypes.map((category) => (
                                    <span key={category} className="chip">
                                        {category}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="app-empty-state">No categories assigned.</p>
                        )}
                    </div>
                </div>

                {recipe.imageUrl ? (
                    <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="detail-image"
                    />
                ) : null}
            </section>

            <section className="detail-section-grid">
                <div className="detail-panel">
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
                        <p className="app-empty-state">No ingredients listed.</p>
                    )}
                </div>

                <div className="detail-panel">
                    <div className="detail-review-header" style={{ marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0 }}>Reviews</h2>
                        {user ? (
                            canManage ? (
                                <span className="app-inline-note">You cannot review your own recipe.</span>
                            ) : hasReviewedRecipe ? (
                                <span className="app-inline-note">You already reviewed this recipe.</span>
                            ) : (
                                <Link to={`${PlatrRoutes.Feedback}?recipeId=${recipe.recipeId}`}>Write a review</Link>
                            )
                        ) : (
                            <Link to={PlatrRoutes.Login}>Log in to review</Link>
                        )}
                    </div>
                    {recipe.reviews.length > 0 ? (
                        <div className="review-list">
                            {recipe.reviews.map((review) => (
                                <article key={review.reviewId} className="review-card">
                                    <div className="detail-review-header" style={{ marginBottom: '0.5rem' }}>
                                        <strong>{review.ownerUsername ?? 'Anonymous'}</strong>
                                        <span>
                                            {review.rating != null ? `* ${review.rating}/5` : '-'}
                                            {review.createdAt ? ` • ${formatDate(review.createdAt)}` : ''}
                                        </span>
                                    </div>
                                    <p className="review-copy">{review.text ?? ''}</p>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="app-empty-state">No reviews yet.</p>
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
                    ariaLabel="Delete recipe confirmation"
                />
            ) : null}

            {updateMut.isPending ? (
                <div className="modal-overlay">
                    <div className="modal-dialog modal-dialog--compact">
                        <p className="modal-copy">Saving recipe changes...</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
};