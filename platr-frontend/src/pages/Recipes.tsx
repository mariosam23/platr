import React, { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { canManageRecipe, type RecipeRequest, type RecipeSummaryItem } from '../application/models/recipe';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAppSelector } from '../hooks/useAppStore';
import { RecipeFilters } from '../presentation/recipes/RecipeFilters';
import { RecipeFormModal } from '../presentation/recipes/RecipeFormModal';
import { RecipesTable } from '../presentation/recipes/RecipesTable';
import {
    createRecipe,
    deleteRecipe,
    fetchCategories,
    fetchRecipeDetail,
    fetchRecipes,
    updateRecipe,
} from '../services/recipeService';
import { getApiErrorMessage } from '../utils/apiErrors';

export const Recipes: React.FC = () => {
    const qc = useQueryClient();
    const user = useAppSelector((state) => state.auth.user);

    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [pageError, setPageError] = useState<string | null>(null);
    const [pageNotice, setPageNotice] = useState<string | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [editTargetId, setEditTargetId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RecipeSummaryItem | null>(null);

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: Infinity,
    });

    const { data, isLoading, isFetching, isError } = useQuery({
        queryKey: ['recipes', page, search, selectedCategoryId],
        queryFn: () =>
            fetchRecipes({
                page,
                search,
                categoryId: selectedCategoryId || undefined,
            }),
        placeholderData: keepPreviousData,
    });

    const { data: editTargetDetail, isFetching: isFetchingEdit } = useQuery({
        queryKey: ['recipeDetail', editTargetId],
        queryFn: async () => {
            if (!editTargetId) {
                throw new Error('Recipe id is required.');
            }

            return fetchRecipeDetail(editTargetId);
        },
        enabled: !!editTargetId,
    });

    const invalidateRecipes = () => qc.invalidateQueries({ queryKey: ['recipes'] });

    const createMut = useMutation({
        mutationFn: createRecipe,
        onSuccess: async () => {
            setPageError(null);
            setPageNotice('Recipe added successfully.');
            await invalidateRecipes();
            setAddOpen(false);
        },
        onError: (error) => {
            setPageNotice(null);
            setPageError(getApiErrorMessage(error, 'Failed to save recipe.'));
        },
    });

    const updateMut = useMutation({
        mutationFn: ({ id, body }: { id: string; body: RecipeRequest }) =>
            updateRecipe(id, body),
        onSuccess: async (_, variables) => {
            setPageError(null);
            setPageNotice('Recipe updated successfully.');
            await Promise.all([
                invalidateRecipes(),
                qc.invalidateQueries({ queryKey: ['recipeDetail', variables.id] }),
            ]);
            setEditTargetId(null);
        },
        onError: (error) => {
            setPageNotice(null);
            setPageError(getApiErrorMessage(error, 'Failed to update recipe.'));
        },
    });

    const deleteMut = useMutation({
        mutationFn: deleteRecipe,
        onSuccess: async () => {
            setPageError(null);
            setPageNotice('Recipe deleted successfully.');
            if ((data?.content.length ?? 0) === 1 && page > 0) {
                setPage((currentPage) => currentPage - 1);
            }
            await invalidateRecipes();
            setDeleteTarget(null);
        },
        onError: (error) => {
            setPageNotice(null);
            setPageError(getApiErrorMessage(error, 'Failed to delete recipe.'));
        },
    });

    const recipes = data?.content ?? [];

    const openAddModal = () => {
        setPageError(null);
        setPageNotice(null);
        setAddOpen(true);
    };

    const openEditModal = (recipeId: string) => {
        setPageError(null);
        setPageNotice(null);
        setEditTargetId(recipeId);
    };

    const openDeleteModal = (recipe: RecipeSummaryItem) => {
        setPageError(null);
        setPageNotice(null);
        setDeleteTarget(recipe);
    };

    const commitSearch = () => {
        setPage(0);
        setSearch(searchInput.trim());
    };

    const clearFilters = () => {
        setPage(0);
        setSearchInput('');
        setSearch('');
        setSelectedCategoryId('');
    };

    return (
        <div className="page">
            <div className="page-header">
                <div className="page-heading">
                    <h1>Recipes</h1>
                    <p className="page-subtitle">Browse, filter, and manage the recipe collection from a cleaner workspace.</p>
                </div>
                <button type="button" className="app-button app-button-primary" onClick={openAddModal}>
                    + Add Recipe
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

            <RecipeFilters
                searchInput={searchInput}
                selectedCategoryId={selectedCategoryId}
                categories={categories}
                hasActiveFilters={Boolean(search || selectedCategoryId)}
                isFetching={isFetching}
                isLoading={isLoading}
                onSearchInputChange={setSearchInput}
                onCommitSearch={commitSearch}
                onCategoryChange={(categoryId) => {
                    setPage(0);
                    setSelectedCategoryId(categoryId);
                }}
                onClear={clearFilters}
            />

            {isLoading ? (
                <p className="app-message app-toast">Loading recipes...</p>
            ) : isError ? (
                <p className="app-message app-message-error app-toast">Failed to load recipes.</p>
            ) : (
                <RecipesTable
                    recipes={recipes}
                    page={data}
                    isFetching={isFetching}
                    canManage={(recipe) => canManageRecipe(recipe, user)}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onPageChange={setPage}
                />
            )}

            {addOpen ? (
                <RecipeFormModal
                    categories={categories}
                    onClose={() => setAddOpen(false)}
                    onSave={(body) => createMut.mutate(body)}
                    isLoading={createMut.isPending}
                />
            ) : null}

            {editTargetId ? (
                isFetchingEdit ? (
                    <div className="modal-overlay">
                        <div className="modal-dialog modal-dialog--compact">
                            <p className="modal-copy">Loading recipe details...</p>
                        </div>
                    </div>
                ) : editTargetDetail ? (
                    <RecipeFormModal
                        categories={categories}
                        initial={editTargetDetail}
                        onClose={() => setEditTargetId(null)}
                        onSave={(body) => updateMut.mutate({ id: editTargetId, body })}
                        isLoading={updateMut.isPending}
                    />
                ) : (
                    <div className="modal-overlay">
                        <div className="modal-dialog modal-dialog--compact">
                            <p className="modal-copy">Error loading recipe details.</p>
                            <button type="button" className="app-button app-button-subtle" onClick={() => setEditTargetId(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                )
            ) : null}

            {deleteTarget ? (
                <ConfirmModal
                    message={`Are you sure you want to delete "${deleteTarget.title}"?`}
                    onConfirm={() => deleteMut.mutate(deleteTarget.recipeId)}
                    onCancel={() => setDeleteTarget(null)}
                    isLoading={deleteMut.isPending}
                    ariaLabel="Delete recipe confirmation"
                />
            ) : null}
        </div>
    );
};
