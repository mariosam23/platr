import React from 'react';
import type { CategoryOption } from '../../application/models/recipe';
import { inputStyle } from './recipeStyles';

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
    <div
        style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            alignItems: 'center',
        }}
    >
        <input
            style={{ ...inputStyle, width: 240, marginBottom: 0 }}
            placeholder="Search recipes..."
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    onCommitSearch();
                }
            }}
        />
        <button type="button" onClick={onCommitSearch}>
            Search
        </button>
        <select
            style={{ ...inputStyle, width: 220, marginBottom: 0 }}
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
            <button type="button" onClick={onClear}>
                Clear
            </button>
        ) : null}
        {isFetching && !isLoading ? (
            <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>Updating...</span>
        ) : null}
    </div>
);