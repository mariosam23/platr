import React from 'react';
import { Link } from 'react-router-dom';
import { PlatrRoutes } from '../../application/routes';
import type { RecipeListPage, RecipeSummaryItem } from '../../application/models/recipe';
import { Pagination } from '../../components/Pagination';
import { Table, tableCellStyle, tableHeaderStyle } from '../../components/Table';
import { difficultyBadgeStyle } from './recipeStyles';

interface RecipesTableProps {
    recipes: RecipeSummaryItem[];
    page: RecipeListPage | null | undefined;
    isFetching: boolean;
    canManage: (recipe: RecipeSummaryItem) => boolean;
    onEdit: (recipeId: string) => void;
    onDelete: (recipe: RecipeSummaryItem) => void;
    onPageChange: (page: number) => void;
}

export const RecipesTable: React.FC<RecipesTableProps> = ({
    recipes,
    page,
    isFetching,
    canManage,
    onEdit,
    onDelete,
    onPageChange,
}) => (
    <>
        <Table isDimmed={isFetching}>
            <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                    <th style={tableHeaderStyle}>Title</th>
                    <th style={tableHeaderStyle}>Difficulty</th>
                    <th style={tableHeaderStyle}>Prep Time</th>
                    <th style={tableHeaderStyle}>Calories</th>
                    <th style={tableHeaderStyle}>Rating</th>
                    <th style={tableHeaderStyle}>Categories</th>
                    <th style={tableHeaderStyle}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {recipes.length === 0 ? (
                    <tr>
                        <td
                            colSpan={7}
                            style={{
                                textAlign: 'center',
                                padding: '3rem',
                                opacity: 0.45,
                            }}
                        >
                            No recipes found.
                        </td>
                    </tr>
                ) : (
                    recipes.map((recipe) => (
                        <tr key={recipe.recipeId} style={{ borderBottom: '1px solid #2a2a2a' }}>
                            <td style={{ ...tableCellStyle, fontWeight: 500 }}>
                                <Link
                                    to={PlatrRoutes.RecipeDetail.replace(':id', recipe.recipeId)}
                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                >
                                    {recipe.title}
                                </Link>
                            </td>
                            <td style={tableCellStyle}>
                                <span style={difficultyBadgeStyle(recipe.difficulty)}>
                                    {recipe.difficulty ?? '-'}
                                </span>
                            </td>
                            <td style={tableCellStyle}>
                                {recipe.prepTimeMinutes != null ? `${recipe.prepTimeMinutes} min` : '-'}
                            </td>
                            <td style={tableCellStyle}>
                                {recipe.calories != null ? `${recipe.calories} kcal` : '-'}
                            </td>
                            <td style={tableCellStyle}>
                                {recipe.avgRating != null ? `* ${recipe.avgRating.toFixed(1)}` : '-'}
                            </td>
                            <td style={{ ...tableCellStyle, fontSize: '0.82rem' }}>
                                {recipe.categoryTypes.length > 0 ? recipe.categoryTypes.join(', ') : '-'}
                            </td>
                            <td style={{ ...tableCellStyle, whiteSpace: 'nowrap' }}>
                                {canManage(recipe) ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => onEdit(recipe.recipeId)}
                                            style={{
                                                marginRight: '0.5rem',
                                                padding: '0.3rem 0.7rem',
                                                fontSize: '0.82rem',
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(recipe)}
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
                                    </>
                                ) : null}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </Table>

        <Pagination page={page} onPageChange={onPageChange} />
    </>
);