import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlatrRoutes } from '../application/routes';
import { useAppSelector } from '../hooks/useAppStore';
import { fetchUserPostedReviews } from '../services/recipeService';
import { formatDate } from '../utils/formatDate';
import { getApiErrorMessage } from '../utils/apiErrors';

export const Reviews: React.FC = () => {
    const userId = useAppSelector((state) => state.auth.user?.userId ?? '');

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['userPostedReviews', userId],
        queryFn: () => fetchUserPostedReviews(userId),
        enabled: Boolean(userId.trim()),
    });

    if (!userId.trim()) {
        return (
            <div className="page">
                <h1>Reviews</h1>
                <p className="app-inline-note">Your account does not include a user id, so posted reviews cannot be listed.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="page">
                <h1>Reviews</h1>
                <p>Loading your reviews…</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="page">
                <h1>Reviews</h1>
                <p className="app-inline-note" role="alert">
                    {getApiErrorMessage(error, 'Could not load your reviews.')}
                </p>
            </div>
        );
    }

    return (
        <div className="page">
            <h1>Your reviews</h1>
            {!data?.length ? (
                <p className="app-empty-state">You have not posted any reviews yet.</p>
            ) : (
                <div className="review-list">
                    {data.map(({ recipeId, recipeTitle, review }) => (
                        <article key={`${recipeId}-${review.reviewId ?? review.createdAt ?? review.text}`} className="review-card">
                            <div className="detail-review-header" style={{ marginBottom: '0.5rem' }}>
                                <Link to={PlatrRoutes.RecipeDetail.replace(':id', recipeId)}>{recipeTitle}</Link>
                                <span>
                                    {review.rating != null ? `* ${review.rating}/5` : '-'}
                                    {review.createdAt ? ` • ${formatDate(review.createdAt)}` : ''}
                                </span>
                            </div>
                            <p className="review-copy">{review.text ?? ''}</p>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};
