import type React from 'react';

export function difficultyBadgeStyle(difficulty?: string | null): React.CSSProperties {
    const base: React.CSSProperties = {
        display: 'inline-block',
        padding: '0.15rem 0.6rem',
        borderRadius: 12,
        fontSize: '0.77rem',
        fontWeight: 700,
    };

    if (difficulty === 'EASY') {
        return { ...base, background: 'rgba(5, 150, 105, 0.18)', color: 'var(--color-success)' };
    }

    if (difficulty === 'HARD') {
        return { ...base, background: 'rgba(127, 29, 29, 0.28)', color: '#fecaca' };
    }

    return { ...base, background: 'rgba(251, 191, 36, 0.16)', color: 'var(--color-warning)' };
}