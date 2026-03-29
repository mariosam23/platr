import React from 'react';
import { Link } from 'react-router-dom';
import { PlatrRoutes } from '../../application/routes';
import type { RecipeSummaryItem } from '../../application/models/recipe';
import type { SpringPage } from '../../application/models/page';
import { Pagination } from '../../components/Pagination';
import { Table } from '../../components/Table';
import { difficultyBadgeStyle } from './recipeStyles';

interface RecipesTableProps {
    recipes: RecipeSummaryItem[];
    page: SpringPage<RecipeSummaryItem> | null | undefined;
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
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Prep Time</th>
                    <th>Calories</th>
                    <th>Rating</th>
                    <th>Categories</th>
                    <th>Actions</th>
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
                            <td style={{ fontWeight: 500 }}>
                                <Link
                                    to={PlatrRoutes.RecipeDetail.replace(':id', recipe.recipeId)}
                                    className="table-primary-link"
                                >
                                    {recipe.title}
                                </Link>
                            </td>
                            <td>
                                <span style={difficultyBadgeStyle(recipe.difficulty)}>
                                    {recipe.difficulty ?? '-'}
                                </span>
                            </td>
                            <td>{recipe.prepTimeMinutes != null ? `${recipe.prepTimeMinutes} min` : '-'}</td>
                            <td>{recipe.calories != null ? `${recipe.calories} kcal` : '-'}</td>
                            <td>
                                {recipe.avgRating != null ? (
                                    <span className="table-rating" aria-label={`Rated ${recipe.avgRating.toFixed(1)} out of 5`}>
                                        <span className="table-rating__star" aria-hidden="true">
                                            ★
                                        </span>
                                        <span className="table-rating__value">{recipe.avgRating.toFixed(1)}</span>
                                    </span>
                                ) : (
                                    '-'
                                )}
                            </td>
                            <td className="table-cell-muted">
                                {recipe.categoryTypes.length > 0 ? recipe.categoryTypes.join(', ') : '-'}
                            </td>
                            <td className="table-actions-cell">
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