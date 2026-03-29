import React from 'react';
import type { CategoryOption } from '../../application/models/recipe';

interface RecipeFiltersProps {
    searchInput: string;
    selectedCategoryId: string;
    categories: CategoryOption[];
    hasActiveFilters: boolean;
    isFetching: boolean;
    isLoading: boolean;
    onSearchInputChange: (value: string) => void;
    onCommitSearch: () => void;
    onCategoryChange: (categoryId: string) => void;
    onClear: () => void;
}

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({
    searchInput,
    selectedCategoryId,
    categories,
    hasActiveFilters,
    isFetching,
    isLoading,
    onSearchInputChange,
    onCommitSearch,
    onCategoryChange,
    onClear,
}) => (
    <div className="filter-bar">
        <input
            className="filter-bar__control"
            placeholder="Search recipes..."
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    onCommitSearch();
                }
            }}
        />
        <button type="button" className="app-button" onClick={onCommitSearch}>
            Search
        </button>
        <select
            className="filter-bar__control filter-bar__control--compact"
            value={selectedCategoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
        >
            <option value="">All categories</option>
            {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryType}
                </option>
            ))}
        </select>
        {hasActiveFilters ? (
            <button type="button" className="app-button app-button-subtle" onClick={onClear}>
                Clear
            </button>
        ) : null}
        {isFetching && !isLoading ? (
            <span className="filter-bar__status">Updating...</span>
        ) : null}
    </div>
);