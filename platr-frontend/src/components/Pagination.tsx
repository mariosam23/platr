import React from 'react';
import type { SpringPageMetadata } from '../application/models/page';

interface PaginationProps {
    page: SpringPageMetadata | null | undefined;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
}

function getVisiblePages(currentPage: number, totalPages: number, maxVisiblePages: number) {
    const visiblePages = Math.max(1, Math.min(maxVisiblePages, totalPages));
    const halfWindow = Math.floor(visiblePages / 2);
    const start = Math.max(0, Math.min(currentPage - halfWindow, totalPages - visiblePages));

    return Array.from({ length: visiblePages }, (_, index) => start + index);
}

export const Pagination: React.FC<PaginationProps> = ({
    page,
    onPageChange,
    maxVisiblePages = 7,
}) => {
    if (!page || page.totalPages <= 1) {
        return null;
    }

    const currentPage = page.number;
    const visiblePages = getVisiblePages(currentPage, page.totalPages, maxVisiblePages);

    return (
        <div className="pagination">
            <span className="pagination__summary">
                Page {currentPage + 1} of {page.totalPages}
            </span>
            <button
                type="button"
                className="app-button pagination__button"
                disabled={page.first}
                onClick={() => onPageChange(currentPage - 1)}
            >
                Previous
            </button>
            {visiblePages.map((pageIndex) => (
                <button
                    key={pageIndex}
                    type="button"
                    className={`app-button pagination__button${pageIndex === currentPage ? ' pagination__button--current' : ''}`}
                    onClick={() => onPageChange(pageIndex)}
                    aria-current={pageIndex === currentPage ? 'page' : undefined}
                >
                    {pageIndex + 1}
                </button>
            ))}
            <button
                type="button"
                className="app-button pagination__button"
                disabled={page.last}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next
            </button>
        </div>
    );
};