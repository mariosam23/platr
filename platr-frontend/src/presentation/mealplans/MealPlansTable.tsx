import React from 'react';
import { Link } from 'react-router-dom';
import type { MealPlanItem } from '../../application/models/mealPlan';
import type { SpringPage } from '../../application/models/page';
import { PlatrRoutes } from '../../application/routes';
import { Pagination } from '../../components/Pagination';
import { Table } from '../../components/Table';
import { formatDate } from '../../utils/formatDate';

interface MealPlansTableProps {
    mealPlans: MealPlanItem[];
    page: SpringPage<MealPlanItem> | null | undefined;
    isFetching: boolean;
    onEdit: (mealPlanId: string) => void;
    onDelete: (mealPlan: MealPlanItem) => void;
    onPageChange: (page: number) => void;
}

export const MealPlansTable: React.FC<MealPlansTableProps> = ({
    mealPlans,
    page,
    isFetching,
    onEdit,
    onDelete,
    onPageChange,
}) => (
    <>
        <Table isDimmed={isFetching}>
            <thead>
                <tr>
                    <th>Week Start</th>
                    <th>Notes</th>
                    <th>Meals Count</th>
                    <th>Created At</th>
                    <th>Owner</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {mealPlans.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="data-table__empty">
                            No meal plans found.
                        </td>
                    </tr>
                ) : (
                    mealPlans.map((mealPlan) => (
                        <tr key={mealPlan.mealPlanId}>
                            <td>
                                <Link className="table-primary-link" to={PlatrRoutes.MealPlanDetail.replace(':id', mealPlan.mealPlanId)}>
                                    {formatDate(mealPlan.weekStart)}
                                </Link>
                            </td>
                            <td>
                                <div className="table-note" title={mealPlan.notes}>
                                    {mealPlan.notes}
                                </div>
                            </td>
                            <td>{mealPlan.recipes.length}</td>
                            <td>{mealPlan.createdAt ? formatDate(mealPlan.createdAt) : '-'}</td>
                            <td>{mealPlan.ownerUsername}</td>
                            <td className="table-actions-cell">
                                <div className="table-action-group">
                                    <Link className="app-button app-button-subtle app-button-small" to={PlatrRoutes.MealPlanDetail.replace(':id', mealPlan.mealPlanId)}>
                                        View
                                    </Link>
                                    <button
                                        type="button"
                                        className="app-button app-button-small"
                                        onClick={() => onEdit(mealPlan.mealPlanId)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="app-button app-button-danger app-button-small"
                                        onClick={() => onDelete(mealPlan)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </Table>

        <Pagination page={page} onPageChange={onPageChange} />
    </>
);