import React, { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MealPlanItem, MealPlanRequest } from '../application/models/mealPlan';
import { ConfirmModal } from '../presentation/recipes/ConfirmModal';
import { MealPlanFormModal } from '../presentation/mealplans/MealPlanFormModal';
import { modalBaseStyle, overlayStyle } from '../presentation/recipes/recipeStyles';
import { MealPlansTable } from '../presentation/mealplans/MealPlansTable';
import {
	createMealPlan,
	deleteMealPlan,
	fetchMealPlanDetail,
	fetchMealPlans,
	updateMealPlan,
} from '../services/mealPlanService';
import { fetchRecipeOptions } from '../services/recipeService';
import { getApiErrorMessage } from '../utils/apiErrors';

export const MealPlans: React.FC = () => {
	const qc = useQueryClient();

	const [page, setPage] = useState(0);
	const [pageError, setPageError] = useState<string | null>(null);
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editTargetId, setEditTargetId] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<MealPlanItem | null>(null);

	const { data, isLoading, isFetching, isError } = useQuery({
		queryKey: ['mealPlans', page],
		queryFn: () => fetchMealPlans(page),
		placeholderData: keepPreviousData,
	});

	const { data: recipeOptions = [] } = useQuery({
		queryKey: ['mealPlanRecipeOptions'],
		queryFn: () => fetchRecipeOptions(100),
		staleTime: 60_000,
	});

	const { data: editTargetDetail, isFetching: isFetchingEdit } = useQuery({
		queryKey: ['mealPlanDetail', editTargetId],
		queryFn: async () => {
			if (!editTargetId) {
				throw new Error('Meal plan id is required.');
			}

			return fetchMealPlanDetail(editTargetId);
		},
		enabled: !!editTargetId,
	});

	const invalidateMealPlans = () => qc.invalidateQueries({ queryKey: ['mealPlans'] });

	const createMut = useMutation({
		mutationFn: createMealPlan,
		onSuccess: async () => {
			setPageError(null);
			await invalidateMealPlans();
			setIsAddOpen(false);
		},
		onError: (error) => {
			setPageError(getApiErrorMessage(error, 'Failed to save meal plan.'));
		},
	});

	const updateMut = useMutation({
		mutationFn: ({ id, body }: { id: string; body: MealPlanRequest }) => updateMealPlan(id, body),
		onSuccess: async (_, variables) => {
			setPageError(null);
			await Promise.all([
				invalidateMealPlans(),
				qc.invalidateQueries({ queryKey: ['mealPlanDetail', variables.id] }),
			]);
			setEditTargetId(null);
		},
		onError: (error) => {
			setPageError(getApiErrorMessage(error, 'Failed to update meal plan.'));
		},
	});

	const deleteMut = useMutation({
		mutationFn: deleteMealPlan,
		onSuccess: async () => {
			setPageError(null);
			if ((data?.content.length ?? 0) === 1 && page > 0) {
				setPage((currentPage) => currentPage - 1);
			}
			await invalidateMealPlans();
			setDeleteTarget(null);
		},
		onError: (error) => {
			setPageError(getApiErrorMessage(error, 'Failed to delete meal plan.'));
		},
	});

	const mealPlans = data?.content ?? [];
	const totalPages = data?.totalPages ?? 0;

	return (
		<div className="page">
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
				<h1 style={{ margin: 0 }}>Meal Plans</h1>
				<button
					type="button"
					onClick={() => {
						setPageError(null);
						setIsAddOpen(true);
					}}
					style={{
						background: '#4f46e5',
						color: '#fff',
						borderColor: '#6366f1',
					}}
				>
					+ Add Meal Plan
				</button>
			</div>

			{pageError ? (
				<p role="alert" style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
					{pageError}
				</p>
			) : null}

			{isLoading ? (
				<p>Loading...</p>
			) : isError ? (
				<p style={{ color: '#ff6b6b' }}>Failed to load meal plans.</p>
			) : (
				<MealPlansTable
					mealPlans={mealPlans}
					page={page}
					totalPages={totalPages}
					isFetching={isFetching}
					onEdit={(mealPlanId) => {
						setPageError(null);
						setEditTargetId(mealPlanId);
					}}
					onDelete={(mealPlan) => {
						setPageError(null);
						setDeleteTarget(mealPlan);
					}}
					onPageChange={setPage}
				/>
			)}

			{isAddOpen ? (
				<MealPlanFormModal
					recipes={recipeOptions}
					onClose={() => setIsAddOpen(false)}
					onSave={(body) => createMut.mutate(body)}
					isLoading={createMut.isPending}
				/>
			) : null}

			{editTargetId ? (
				isFetchingEdit ? (
					<div style={overlayStyle}>
						<div style={modalBaseStyle}>
							<p>Loading meal plan details...</p>
						</div>
					</div>
				) : editTargetDetail ? (
					<MealPlanFormModal
						recipes={recipeOptions}
						initial={editTargetDetail}
						onClose={() => setEditTargetId(null)}
						onSave={(body) => updateMut.mutate({ id: editTargetId, body })}
						isLoading={updateMut.isPending}
					/>
				) : (
					<div style={overlayStyle}>
						<div style={modalBaseStyle}>
							<p>Error loading meal plan details.</p>
							<button type="button" onClick={() => setEditTargetId(null)}>
								Close
							</button>
						</div>
					</div>
				)
			) : null}

			{deleteTarget ? (
				<ConfirmModal
					message={`Are you sure you want to delete the meal plan starting ${deleteTarget.weekStart}?`}
					onConfirm={() => deleteMut.mutate(deleteTarget.mealPlanId)}
					onCancel={() => setDeleteTarget(null)}
					isLoading={deleteMut.isPending}
				/>
			) : null}
		</div>
	);
};
