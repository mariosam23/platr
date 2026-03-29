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
        <div
            style={{
                display: 'flex',
                gap: '0.4rem',
                alignItems: 'center',
                marginTop: '1.5rem',
                flexWrap: 'wrap',
            }}
        >
            <button type="button" disabled={page.first} onClick={() => onPageChange(currentPage - 1)}>
                Previous
            </button>
            {visiblePages.map((pageIndex) => (
                <button
                    key={pageIndex}
                    type="button"
                    onClick={() => onPageChange(pageIndex)}
                    aria-current={pageIndex === currentPage ? 'page' : undefined}
                    style={{
                        minWidth: '2.25rem',
                        fontWeight: pageIndex === currentPage ? 700 : undefined,
                        borderColor: pageIndex === currentPage ? '#6366f1' : undefined,
                        background: pageIndex === currentPage ? '#312e81' : undefined,
                    }}
                >
                    {pageIndex + 1}
                </button>
            ))}
            <button type="button" disabled={page.last} onClick={() => onPageChange(currentPage + 1)}>
                Next
            </button>
        </div>
    );
};