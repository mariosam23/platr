import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
    DAY_OF_WEEK_OPTIONS,
    MEAL_TYPE_OPTIONS,
    canManageMealPlan,
    type DayOfWeek,
    type MealType,
} from '../application/models/mealPlan';
import { PlatrRoutes } from '../application/routes';
import { ConfirmModal } from '../components/ConfirmModal';
import { Table } from '../components/Table';
import { useAppSelector } from '../hooks/useAppStore';
import { MealPlanFormModal } from '../presentation/mealplans/MealPlanFormModal';
import {
    deleteMealPlan,
    fetchMealPlanDetail,
    updateMealPlan,
} from '../services/mealPlanService';
import { fetchRecipeOptions } from '../services/recipeService';
import { getApiErrorMessage } from '../utils/apiErrors';
import { formatDate } from '../utils/formatDate';

const dayLabels: Record<DayOfWeek, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
};

const mealTypeLabels: Record<MealType, string> = {
    BREAKFAST: 'Breakfast',
    LUNCH: 'Lunch',
    DINNER: 'Dinner',
    SNACK: 'Snack',
};

export const MealPlanDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const mealPlanId = id ?? '';
    const navigate = useNavigate();
    const qc = useQueryClient();
    const user = useAppSelector((state) => state.auth.user);

    const [pageError, setPageError] = useState<string | null>(null);
    const [pageNotice, setPageNotice] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const { data: mealPlan, isLoading, isError } = useQuery({
        queryKey: ['mealPlanDetail', mealPlanId],
        queryFn: () => fetchMealPlanDetail(mealPlanId),
        enabled: Boolean(id),
    });

    const { data: recipeOptions = [] } = useQuery({
        queryKey: ['mealPlanRecipeOptions'],
        queryFn: () => fetchRecipeOptions(100),
        staleTime: 60_000,
        enabled: isEditing,
    });

    const updateMut = useMutation({
        mutationFn: (body: NonNullable<Parameters<typeof updateMealPlan>[1]>) => updateMealPlan(mealPlanId, body),
        onSuccess: async () => {
            setPageError(null);
            setPageNotice('Meal plan updated successfully.');
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['mealPlans'] }),
                qc.invalidateQueries({ queryKey: ['mealPlanDetail', mealPlanId] }),
            ]);
            setIsEditing(false);
        },
        onError: (error) => {
            setPageNotice(null);
            setPageError(getApiErrorMessage(error, 'Failed to update meal plan.'));
        },
    });

    const deleteMut = useMutation({
        mutationFn: () => deleteMealPlan(mealPlanId),
        onSuccess: async () => {
            setPageError(null);
            setPageNotice(null);
            await qc.invalidateQueries({ queryKey: ['mealPlans'] });
            navigate(PlatrRoutes.MealPlans);
        },
        onError: (error) => {
            setPageNotice(null);
            setPageError(getApiErrorMessage(error, 'Failed to delete meal plan.'));
        },
    });

    if (!id) {
        return <Navigate to={PlatrRoutes.MealPlans} replace />;
    }

    if (isLoading) {
        return <div className="page"><p className="app-message app-toast">Loading meal plan...</p></div>;
    }

    if (isError || !mealPlan) {
        return (
            <div className="page">
                <p className="app-message app-message-error app-toast">Failed to load meal plan details.</p>
                <Link to={PlatrRoutes.MealPlans}>Back to meal plans</Link>
            </div>
        );
    }

    const canManage = canManageMealPlan(mealPlan, user);

    return (
        <div className="page">
            <div>
                <Link className="page-back-link" to={PlatrRoutes.MealPlans}>Back to meal plans</Link>
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

            <section className="detail-panel" style={{ marginBottom: '1.5rem' }}>
                <div className="detail-topline">
                <div>
                    <h1 style={{ margin: '0 0 0.75rem' }}>Meal Plan for {formatDate(mealPlan.weekStart)}</h1>
                    <p className="detail-copy" style={{ maxWidth: 720 }}>{mealPlan.notes}</p>
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
            </section>

            <section className="detail-meta-grid">
                <div>
                    <span className="detail-meta-label">Owner</span>
                    <div>{mealPlan.ownerUsername}</div>
                </div>
                <div>
                    <span className="detail-meta-label">Assignments</span>
                    <div>{mealPlan.recipes.length}</div>
                </div>
                <div>
                    <span className="detail-meta-label">Created</span>
                    <div>{mealPlan.createdAt ? formatDate(mealPlan.createdAt) : '-'}</div>
                </div>
                <div>
                    <span className="detail-meta-label">Updated</span>
                    <div>{mealPlan.updatedAt ? formatDate(mealPlan.updatedAt) : '-'}</div>
                </div>
            </section>

            <section className="detail-panel">
                <h2 style={{ marginBottom: '1rem' }}>Weekly Schedule</h2>
                <Table tableStyle={{ minWidth: 760 }}>
                        <thead>
                            <tr>
                                <th>Meal Type</th>
                                {DAY_OF_WEEK_OPTIONS.map((day) => (
                                    <th key={day}>{dayLabels[day]}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {MEAL_TYPE_OPTIONS.map((mealType) => (
                                <tr key={mealType}>
                                    <th style={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                                        {mealTypeLabels[mealType]}
                                    </th>
                                    {DAY_OF_WEEK_OPTIONS.map((day) => {
                                        const assignment = mealPlan.recipes.find(
                                            (recipe) => recipe.mealType === mealType && recipe.dayOfWeek === day,
                                        );

                                        return (
                                            <td key={day} style={{ minWidth: 130 }}>
                                                {assignment ? (
                                                    <div className="app-form-stack">
                                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                            {assignment.recipeTitle}
                                                        </div>
                                                        <Link to={PlatrRoutes.Recipes + `/${assignment.recipeId}`}>
                                                            View recipe
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <span className="table-placeholder">Unassigned</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                </Table>
            </section>

            {isEditing ? (
                <MealPlanFormModal
                    recipes={recipeOptions}
                    initial={mealPlan}
                    onClose={() => setIsEditing(false)}
                    onSave={(body) => updateMut.mutate(body)}
                    isLoading={updateMut.isPending}
                />
            ) : null}

            {isDeleteConfirmOpen ? (
                <ConfirmModal
                    message={`Are you sure you want to delete the meal plan starting ${mealPlan.weekStart}?`}
                    onConfirm={() => deleteMut.mutate()}
                    onCancel={() => setIsDeleteConfirmOpen(false)}
                    isLoading={deleteMut.isPending}
                    ariaLabel="Delete meal plan confirmation"
                />
            ) : null}

            {updateMut.isPending ? (
                <div className="modal-overlay">
                    <div className="modal-dialog modal-dialog--compact">
                        <p className="modal-copy">Saving meal plan changes...</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
};