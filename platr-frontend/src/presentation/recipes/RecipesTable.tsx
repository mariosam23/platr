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
                <tr>
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
                        <td colSpan={7} className="data-table__empty">
                            No recipes found.
                        </td>
                    </tr>
                ) : (
                    recipes.map((recipe) => (
                        <tr key={recipe.recipeId}>
                            <td style={{ ...tableCellStyle, fontWeight: 500 }}>
                                <Link
                                    to={PlatrRoutes.RecipeDetail.replace(':id', recipe.recipeId)}
                                    className="table-primary-link"
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
                            <td style={tableCellStyle} className="table-cell-muted">
                                {recipe.categoryTypes.length > 0 ? recipe.categoryTypes.join(', ') : '-'}
                            </td>
                            <td style={tableCellStyle} className="table-actions-cell">
                                {canManage(recipe) ? (
                                    <div className="table-action-group">
                                        <button
                                            type="button"
                                            className="app-button app-button-small"
                                            onClick={() => onEdit(recipe.recipeId)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="app-button app-button-danger app-button-small"
                                            onClick={() => onDelete(recipe)}
                                        >
                                            Delete
                                        </button>
                                    </div>
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