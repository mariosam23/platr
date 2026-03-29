import React from 'react';
import { Link } from 'react-router-dom';
import type { MealPlanItem, MealPlanPage } from '../../application/models/mealPlan';
import { PlatrRoutes } from '../../application/routes';
import { Pagination } from '../../components/Pagination';
import { Table, tableCellStyle, tableHeaderStyle } from '../../components/Table';
import { formatDate } from '../../utils/formatDate';

interface MealPlansTableProps {
    mealPlans: MealPlanItem[];
    page: MealPlanPage | null | undefined;
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
                    <th style={tableHeaderStyle}>Week Start</th>
                    <th style={tableHeaderStyle}>Notes</th>
                    <th style={tableHeaderStyle}>Meals Count</th>
                    <th style={tableHeaderStyle}>Created At</th>
                    <th style={tableHeaderStyle}>Owner</th>
                    <th style={tableHeaderStyle}>Actions</th>
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
                            <td style={tableCellStyle}>
                                <Link className="table-primary-link" to={PlatrRoutes.MealPlans + `/${mealPlan.mealPlanId}`}>
                                    {formatDate(mealPlan.weekStart)}
                                </Link>
                            </td>
                            <td style={tableCellStyle}>
                                <div className="table-note" title={mealPlan.notes}>
                                    {mealPlan.notes}
                                </div>
                            </td>
                            <td style={tableCellStyle}>{mealPlan.recipes.length}</td>
                            <td style={tableCellStyle}>{mealPlan.createdAt ? formatDate(mealPlan.createdAt) : '-'}</td>
                            <td style={tableCellStyle}>{mealPlan.ownerUsername}</td>
                            <td style={tableCellStyle} className="table-actions-cell">
                                <div className="table-action-group">
                                    <Link className="app-button app-button-subtle app-button-small" to={PlatrRoutes.MealPlans + `/${mealPlan.mealPlanId}`}>
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