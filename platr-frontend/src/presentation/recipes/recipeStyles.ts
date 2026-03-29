import type React from 'react';

export const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
};

export const modalBaseStyle: React.CSSProperties = {
    background: '#1e1e1e',
    borderRadius: 10,
    padding: '2rem',
    width: '90%',
};

export const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.75rem',
    borderRadius: 6,
    border: '1px solid #444',
    background: '#2a2a2a',
    color: 'inherit',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
};

export const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.3rem',
    fontSize: '0.875rem',
    opacity: 0.8,
};

export const errorTextStyle: React.CSSProperties = {
    color: '#ff6b6b',
    fontSize: '0.78rem',
    display: 'block',
    marginTop: '-0.5rem',
    marginBottom: '0.5rem',
};

export function difficultyBadgeStyle(difficulty?: string | null): React.CSSProperties {
    const base: React.CSSProperties = {
        display: 'inline-block',
        padding: '0.15rem 0.6rem',
        borderRadius: 12,
        fontSize: '0.77rem',
        fontWeight: 700,
    };

    if (difficulty === 'EASY') {
        return { ...base, background: '#14532d', color: '#86efac' };
    }

    if (difficulty === 'HARD') {
        return { ...base, background: '#450a0a', color: '#fca5a5' };
    }

    return { ...base, background: '#422006', color: '#fcd34d' };
}