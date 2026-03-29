import React, { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MealPlanItem, MealPlanRequest } from '../application/models/mealPlan';
import { ConfirmModal } from '../components/ConfirmModal';
import { MealPlanFormModal } from '../presentation/mealplans/MealPlanFormModal';
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
	const [pageNotice, setPageNotice] = useState<string | null>(null);
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
			setPageNotice('Meal plan added successfully.');
			await invalidateMealPlans();
			setIsAddOpen(false);
		},
		onError: (error) => {
			setPageNotice(null);
			setPageError(getApiErrorMessage(error, 'Failed to save meal plan.'));
		},
	});

	const updateMut = useMutation({
		mutationFn: ({ id, body }: { id: string; body: MealPlanRequest }) => updateMealPlan(id, body),
		onSuccess: async (_, variables) => {
			setPageError(null);
			setPageNotice('Meal plan updated successfully.');
			await Promise.all([
				invalidateMealPlans(),
				qc.invalidateQueries({ queryKey: ['mealPlanDetail', variables.id] }),
			]);
			setEditTargetId(null);
		},
		onError: (error) => {
			setPageNotice(null);
			setPageError(getApiErrorMessage(error, 'Failed to update meal plan.'));
		},
	});

	const deleteMut = useMutation({
		mutationFn: deleteMealPlan,
		onSuccess: async () => {
			setPageError(null);
			setPageNotice('Meal plan deleted successfully.');
			if ((data?.content.length ?? 0) === 1 && page > 0) {
				setPage((currentPage) => currentPage - 1);
			}
			await invalidateMealPlans();
			setDeleteTarget(null);
		},
		onError: (error) => {
			setPageNotice(null);
			setPageError(getApiErrorMessage(error, 'Failed to delete meal plan.'));
		},
	});

	const mealPlans = data?.content ?? [];

	return (
		<div className="page">
			<div className="page-header">
				<div className="page-heading">
					<h1>Meal Plans</h1>
					<p className="page-subtitle">Shape weekly schedules in a layout that is easier to scan and update.</p>
				</div>
				<button
					type="button"
					className="app-button app-button-primary"
					onClick={() => {
						setPageError(null);
						setPageNotice(null);
						setIsAddOpen(true);
					}}
				>
					+ Add Meal Plan
				</button>
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

			{isLoading ? (
				<p className="app-message app-toast">Loading meal plans...</p>
			) : isError ? (
				<p className="app-message app-message-error app-toast">Failed to load meal plans.</p>
			) : (
				<MealPlansTable
					mealPlans={mealPlans}
					page={data}
					isFetching={isFetching}
					onEdit={(mealPlanId) => {
						setPageError(null);
						setPageNotice(null);
						setEditTargetId(mealPlanId);
					}}
					onDelete={(mealPlan) => {
						setPageError(null);
						setPageNotice(null);
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
					<div className="modal-overlay">
						<div className="modal-dialog modal-dialog--compact">
							<p className="modal-copy">Loading meal plan details...</p>
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
						<div className="modal-overlay">
							<div className="modal-dialog modal-dialog--compact">
								<p className="modal-copy">Error loading meal plan details.</p>
								<button type="button" className="app-button app-button-subtle" onClick={() => setEditTargetId(null)}>
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
					ariaLabel="Delete meal plan confirmation"
				/>
			) : null}
		</div>
	);
};
