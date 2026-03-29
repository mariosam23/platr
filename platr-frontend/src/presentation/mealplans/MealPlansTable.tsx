import React from 'react';
import type { MealPlanItem } from '../../application/models/mealPlan';
import { formatDate } from '../../utils/formatDate';
import { tableCellStyle, tableHeaderStyle } from '../recipes/recipeStyles';

interface MealPlansTableProps {
    mealPlans: MealPlanItem[];
    page: number;
    totalPages: number;
    isFetching: boolean;
    onEdit: (mealPlanId: string) => void;
    onDelete: (mealPlan: MealPlanItem) => void;
    onPageChange: (page: number) => void;
}

export const MealPlansTable: React.FC<MealPlansTableProps> = ({
    mealPlans,
    page,
    totalPages,
    isFetching,
    onEdit,
    onDelete,
    onPageChange,
}) => (
    <>
        <div
            style={{
                overflowX: 'auto',
                opacity: isFetching ? 0.6 : 1,
                transition: 'opacity 0.15s',
            }}
        >
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.95rem',
                }}
            >
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
                                <td style={tableCellStyle}>{formatDate(mealPlan.weekStart)}</td>
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
            </table>
        </div>

        {totalPages > 1 ? (
            <div
                style={{
                    display: 'flex',
                    gap: '0.4rem',
                    alignItems: 'center',
                    marginTop: '1.5rem',
                    flexWrap: 'wrap',
                }}
            >
                <button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
                    Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onPageChange(index)}
                        style={{
                            minWidth: '2.25rem',
                            fontWeight: index === page ? 700 : undefined,
                            borderColor: index === page ? '#6366f1' : undefined,
                            background: index === page ? '#312e81' : undefined,
                        }}
                    >
                        {index + 1}
                    </button>
                ))}
                <button type="button" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
                    Next
                </button>
            </div>
        ) : null}
    </>
);