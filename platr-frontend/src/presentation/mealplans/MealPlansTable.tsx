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
                <tr style={{ borderBottom: '2px solid #333' }}>
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
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', opacity: 0.45 }}>
                            No meal plans found.
                        </td>
                    </tr>
                ) : (
                    mealPlans.map((mealPlan) => (
                        <tr key={mealPlan.mealPlanId} style={{ borderBottom: '1px solid #2a2a2a' }}>
                            <td style={tableCellStyle}>
                                <Link to={PlatrRoutes.MealPlans + `/${mealPlan.mealPlanId}`}>
                                    {formatDate(mealPlan.weekStart)}
                                </Link>
                            </td>
                            <td style={{ ...tableCellStyle, maxWidth: 320 }}>
                                <div
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                    title={mealPlan.notes}
                                >
                                    {mealPlan.notes}
                                </div>
                            </td>
                            <td style={tableCellStyle}>{mealPlan.recipes.length}</td>
                            <td style={tableCellStyle}>{mealPlan.createdAt ? formatDate(mealPlan.createdAt) : '-'}</td>
                            <td style={tableCellStyle}>{mealPlan.ownerUsername}</td>
                            <td style={{ ...tableCellStyle, whiteSpace: 'nowrap' }}>
                                <Link
                                    to={PlatrRoutes.MealPlans + `/${mealPlan.mealPlanId}`}
                                    style={{ marginRight: '0.5rem', fontSize: '0.82rem' }}
                                >
                                    View
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => onEdit(mealPlan.mealPlanId)}
                                    style={{ marginRight: '0.5rem', padding: '0.3rem 0.7rem', fontSize: '0.82rem' }}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(mealPlan)}
                                    style={{
                                        padding: '0.3rem 0.7rem',
                                        fontSize: '0.82rem',
                                        background: '#3a1515',
                                        borderColor: '#ef4444',
                                        color: '#fca5a5',
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </Table>

        <Pagination page={page} onPageChange={onPageChange} />
    </>
);