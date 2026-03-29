import React, { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PlatrRoutes } from '../application/routes';
import {
	createReviewFormValues,
	REVIEW_RATING_OPTIONS,
	reviewFormSchema,
	type ReviewFormValues,
	toReviewRequest,
} from '../application/models/review';
import { useAppSelector } from '../hooks/useAppStore';
import { addRecipeReview, fetchRecipeDetail, fetchRecipeOptions } from '../services/recipeService';
import '../styles/Feedback.css';
import { getApiErrorMessage } from '../utils/apiErrors';

export const Feedback: React.FC = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [searchParams, setSearchParams] = useSearchParams();
	const [serverError, setServerError] = useState<string | null>(null);
	const currentUser = useAppSelector((state) => state.auth.user);
	const recipeIdFromQuery = searchParams.get('recipeId')?.trim() ?? '';

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<ReviewFormValues>({
		resolver: yupResolver(reviewFormSchema),
		defaultValues: createReviewFormValues(recipeIdFromQuery),
	});

	const selectedRecipeId = watch('recipeId');

	useEffect(() => {
		setValue('recipeId', recipeIdFromQuery, { shouldValidate: false, shouldDirty: false });
	}, [recipeIdFromQuery, setValue]);

	const { data: recipeOptions = [], isLoading: isLoadingOptions } = useQuery({
		queryKey: ['recipeOptions', 'feedback'],
		queryFn: () => fetchRecipeOptions(),
		staleTime: 60_000,
	});

	const {
		data: selectedRecipe,
		isLoading: isLoadingSelectedRecipe,
		isError: isSelectedRecipeError,
	} = useQuery({
		queryKey: ['recipeDetail', selectedRecipeId],
		queryFn: () => fetchRecipeDetail(selectedRecipeId),
		enabled: Boolean(selectedRecipeId),
	});

	const addReviewMutation = useMutation({
		mutationFn: (values: ReviewFormValues) => addRecipeReview(values.recipeId, toReviewRequest(values)),
		onSuccess: async (_, values) => {
			setServerError(null);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['recipes'] }),
				queryClient.invalidateQueries({ queryKey: ['recipeDetail', values.recipeId] }),
			]);
			reset(createReviewFormValues(values.recipeId));
			navigate(PlatrRoutes.RecipeDetail.replace(':id', values.recipeId));
		},
		onError: (error) => {
			setServerError(getApiErrorMessage(error, 'Failed to submit review.'));
		},
	});

	const recipeSelect = register('recipeId');
	const hasReviewedRecipe = Boolean(
		currentUser?.userId && selectedRecipe?.reviews.some((review) => review.ownerId === currentUser.userId),
	);
	const isOwnRecipe = Boolean(currentUser?.userId && selectedRecipe?.ownerId === currentUser.userId);
	const canSubmit = Boolean(selectedRecipe) && !isOwnRecipe && !hasReviewedRecipe;
	const recipeChoices = selectedRecipe && !recipeOptions.some((recipe) => recipe.recipeId === selectedRecipe.recipeId)
		? [selectedRecipe, ...recipeOptions]
		: recipeOptions;

	const onSubmit = async (values: ReviewFormValues) => {
		setServerError(null);
		await addReviewMutation.mutateAsync(values);
	};

	return (
		<div className="page feedback-page">
			<div className="feedback-shell">
				<section className="feedback-hero">
					<p className="feedback-eyebrow">Recipe feedback</p>
					<h1>Add a review</h1>
					<p className="feedback-copy">
						Choose a recipe, leave a rating from 1 to 5, and add a short written review. Reviews are attached to recipes only.
					</p>
				</section>

				<section className="feedback-card">
					<form className="feedback-form" onSubmit={handleSubmit(onSubmit)} noValidate>
						{serverError ? (
							<p role="alert" className="feedback-error">
								{serverError}
							</p>
						) : null}

						<div className="feedback-field">
							<label htmlFor="recipeId">Recipe</label>
							<select
								id="recipeId"
								{...recipeSelect}
								onChange={(event) => {
									recipeSelect.onChange(event);

									const nextRecipeId = event.target.value;
									const nextParams = new URLSearchParams(searchParams);
									if (nextRecipeId) {
										nextParams.set('recipeId', nextRecipeId);
									} else {
										nextParams.delete('recipeId');
									}
									setSearchParams(nextParams, { replace: true });
								}}
							>
								<option value="">Select a recipe</option>
								{recipeChoices.map((recipe) => (
									<option key={recipe.recipeId} value={recipe.recipeId}>
										{recipe.title}
									</option>
								))}
							</select>
							{errors.recipeId?.message ? <p className="feedback-field-error">{errors.recipeId.message}</p> : null}
							{isLoadingOptions ? <p className="feedback-help">Loading recipes…</p> : null}
						</div>

						<div className="feedback-field">
							<label htmlFor="rating">Rating</label>
							<select id="rating" {...register('rating')}>
								{REVIEW_RATING_OPTIONS.map((rating) => (
									<option key={rating} value={rating}>
										{rating} / 5
									</option>
								))}
							</select>
							{errors.rating?.message ? <p className="feedback-field-error">{errors.rating.message}</p> : null}
						</div>

						<div className="feedback-field">
							<label htmlFor="text">Review</label>
							<textarea
								id="text"
								rows={6}
								placeholder="What worked well? What should other users know before trying this recipe?"
								{...register('text')}
							/>
							{errors.text?.message ? <p className="feedback-field-error">{errors.text.message}</p> : null}
						</div>

						{selectedRecipeId ? (
							<div className="feedback-status">
								{isLoadingSelectedRecipe ? <p>Loading recipe details…</p> : null}
								{isSelectedRecipeError ? <p role="alert">Failed to load the selected recipe.</p> : null}
								{!isLoadingSelectedRecipe && selectedRecipe ? (
									<>
										<div className="feedback-status-header">
											<strong>{selectedRecipe.title}</strong>
											<Link to={PlatrRoutes.RecipeDetail.replace(':id', selectedRecipe.recipeId)}>
												Open recipe
											</Link>
										</div>
										<p>
											Owner: {selectedRecipe.ownerUsername ?? 'Unknown'}
											{selectedRecipe.avgRating != null ? ` • Current rating ${selectedRecipe.avgRating.toFixed(1)}` : ''}
										</p>
										{isOwnRecipe ? (
											<p role="alert">You cannot review your own recipe.</p>
										) : null}
										{hasReviewedRecipe ? (
											<p role="alert">You already reviewed this recipe.</p>
										) : null}
									</>
								) : null}
							</div>
						) : null}

						<div className="feedback-actions">
							<button
								type="submit"
								className="nav-btn nav-btn-primary"
								disabled={isSubmitting || addReviewMutation.isPending || !canSubmit}
							>
								{isSubmitting || addReviewMutation.isPending ? 'Submitting…' : 'Submit review'}
							</button>
							<Link className="feedback-secondary-link" to={selectedRecipeId ? PlatrRoutes.RecipeDetail.replace(':id', selectedRecipeId) : PlatrRoutes.Recipes}>
								Cancel
							</Link>
						</div>
					</form>
				</section>
			</div>
		</div>
	);
};
