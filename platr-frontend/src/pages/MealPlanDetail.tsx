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
import { Table, tableCellStyle, tableHeaderStyle } from '../components/Table';
import { useAppSelector } from '../hooks/useAppStore';
import { MealPlanFormModal } from '../presentation/mealplans/MealPlanFormModal';
import { modalBaseStyle, overlayStyle } from '../presentation/recipes/recipeStyles';
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
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['mealPlans'] }),
                qc.invalidateQueries({ queryKey: ['mealPlanDetail', mealPlanId] }),
            ]);
            setIsEditing(false);
        },
        onError: (error) => {
            setPageError(getApiErrorMessage(error, 'Failed to update meal plan.'));
        },
    });

    const deleteMut = useMutation({
        mutationFn: () => deleteMealPlan(mealPlanId),
        onSuccess: async () => {
            setPageError(null);
            await qc.invalidateQueries({ queryKey: ['mealPlans'] });
            navigate(PlatrRoutes.MealPlans);
        },
        onError: (error) => {
            setPageError(getApiErrorMessage(error, 'Failed to delete meal plan.'));
        },
    });

    if (!id) {
        return <Navigate to={PlatrRoutes.MealPlans} replace />;
    }

    if (isLoading) {
        return <div className="page"><p>Loading meal plan...</p></div>;
    }

    if (isError || !mealPlan) {
        return (
            <div className="page">
                <p style={{ color: '#ff6b6b' }}>Failed to load meal plan details.</p>
                <Link to={PlatrRoutes.MealPlans}>Back to meal plans</Link>
            </div>
        );
    }

    const canManage = canManageMealPlan(mealPlan, user);

    return (
        <div className="page">
            <div style={{ marginBottom: '1.5rem' }}>
                <Link to={PlatrRoutes.MealPlans}>Back to meal plans</Link>
            </div>

            {pageError ? (
                <p role="alert" style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
                    {pageError}
                </p>
            ) : null}

            <section
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    marginBottom: '1.5rem',
                }}
            >
                <div>
                    <h1 style={{ margin: '0 0 0.75rem' }}>Meal Plan for {formatDate(mealPlan.weekStart)}</h1>
                    <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.7, maxWidth: 720 }}>{mealPlan.notes}</p>
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
            </section>

            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem',
                }}
            >
                <div>
                    <div style={{ opacity: 0.65, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Owner</div>
                    <div>{mealPlan.ownerUsername}</div>
                </div>
                <div>
                    <div style={{ opacity: 0.65, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Assignments</div>
                    <div>{mealPlan.recipes.length}</div>
                </div>
                <div>
                    <div style={{ opacity: 0.65, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Created</div>
                    <div>{mealPlan.createdAt ? formatDate(mealPlan.createdAt) : '-'}</div>
                </div>
                <div>
                    <div style={{ opacity: 0.65, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Updated</div>
                    <div>{mealPlan.updatedAt ? formatDate(mealPlan.updatedAt) : '-'}</div>
                </div>
            </section>

            <section>
                <h2 style={{ marginBottom: '1rem' }}>Weekly Schedule</h2>
                <Table
                    containerStyle={{
                        border: '1px solid #2a2a2a',
                        borderRadius: 12,
                        background: '#121212',
                    }}
                    tableStyle={{ minWidth: 760 }}
                >
                        <thead>
                            <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                                <th style={tableHeaderStyle}>Meal Type</th>
                                {DAY_OF_WEEK_OPTIONS.map((day) => (
                                    <th key={day} style={tableHeaderStyle}>{dayLabels[day]}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {MEAL_TYPE_OPTIONS.map((mealType) => (
                                <tr key={mealType} style={{ borderBottom: '1px solid #2a2a2a' }}>
                                    <th style={{ ...tableHeaderStyle, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                                        {mealTypeLabels[mealType]}
                                    </th>
                                    {DAY_OF_WEEK_OPTIONS.map((day) => {
                                        const assignment = mealPlan.recipes.find(
                                            (recipe) => recipe.mealType === mealType && recipe.dayOfWeek === day,
                                        );

                                        return (
                                            <td key={day} style={{ ...tableCellStyle, minWidth: 130 }}>
                                                {assignment ? (
                                                    <div>
                                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                            {assignment.recipeTitle}
                                                        </div>
                                                        <Link to={PlatrRoutes.Recipes + `/${assignment.recipeId}`}>
                                                            View recipe
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <span style={{ opacity: 0.45 }}>Unassigned</span>
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
                <div style={overlayStyle}>
                    <div style={modalBaseStyle}>
                        <p>Saving meal plan changes...</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
};