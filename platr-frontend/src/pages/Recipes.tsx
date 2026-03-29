import React, { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { canManageRecipe, type RecipeRequest, type RecipeSummaryItem } from '../application/models/recipe';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAppSelector } from '../hooks/useAppStore';
import { RecipeFilters } from '../presentation/recipes/RecipeFilters';
import { RecipeFormModal } from '../presentation/recipes/RecipeFormModal';
import { modalBaseStyle, overlayStyle } from '../presentation/recipes/recipeStyles';
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
            await invalidateRecipes();
            setAddOpen(false);
        },
        onError: (error) => {
            setPageError(getApiErrorMessage(error, 'Failed to save recipe.'));
        },
    });

    const updateMut = useMutation({
        mutationFn: ({ id, body }: { id: string; body: RecipeRequest }) =>
            updateRecipe(id, body),
        onSuccess: async (_, variables) => {
            setPageError(null);
            await Promise.all([
                invalidateRecipes(),
                qc.invalidateQueries({ queryKey: ['recipeDetail', variables.id] }),
            ]);
            setEditTargetId(null);
        },
        onError: (error) => {
            setPageError(getApiErrorMessage(error, 'Failed to update recipe.'));
        },
    });

    const deleteMut = useMutation({
        mutationFn: deleteRecipe,
        onSuccess: async () => {
            setPageError(null);
            if ((data?.content.length ?? 0) === 1 && page > 0) {
                setPage((currentPage) => currentPage - 1);
            }
            await invalidateRecipes();
            setDeleteTarget(null);
        },
        onError: (error) => {
            setPageError(getApiErrorMessage(error, 'Failed to delete recipe.'));
        },
    });

    const recipes = data?.content ?? [];

    const openAddModal = () => {
        setPageError(null);
        setAddOpen(true);
    };

    const openEditModal = (recipeId: string) => {
        setPageError(null);
        setEditTargetId(recipeId);
    };

    const openDeleteModal = (recipe: RecipeSummaryItem) => {
        setPageError(null);
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
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                }}
            >
                <h1 style={{ margin: 0 }}>Recipes</h1>
                <button
                    type="button"
                    onClick={openAddModal}
                    style={{
                        background: '#4f46e5',
                        color: '#fff',
                        borderColor: '#6366f1',
                    }}
                >
                    + Add Recipe
                </button>
            </div>

            {pageError ? (
                <p role="alert" style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
                    {pageError}
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
                <p>Loading...</p>
            ) : isError ? (
                <p style={{ color: '#ff6b6b' }}>Failed to load recipes.</p>
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
                    <div style={overlayStyle}>
                        <div style={modalBaseStyle}>
                            <p>Loading recipe details...</p>
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
                    <div style={overlayStyle}>
                        <div style={modalBaseStyle}>
                            <p>Error loading recipe details.</p>
                            <button type="button" onClick={() => setEditTargetId(null)}>
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
