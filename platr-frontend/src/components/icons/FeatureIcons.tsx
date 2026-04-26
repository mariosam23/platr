import type { SVGProps } from 'react';

const strokeAttrs = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

export function IconRecipeLibrary(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 32 32" width={32} height={32} aria-hidden {...props}>
            <path {...strokeAttrs} d="M6 8a2 2 0 0 1 2-2h9v18H8a2 2 0 0 1-2-2V8Z" />
            <path {...strokeAttrs} d="M17 6h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9V6Z" />
            <path {...strokeAttrs} d="M10 12h5M10 16h5M20 12h5M20 16h4" />
        </svg>
    );
}

export function IconMealCalendar(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 32 32" width={32} height={32} aria-hidden {...props}>
            <path {...strokeAttrs} d="M9 6h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
            <path {...strokeAttrs} d="M7 12h18M12 6v4M20 6v4" />
            <path {...strokeAttrs} d="M11 17h4v3h-4zM15 17h4v3h-4z" opacity={0.85} />
        </svg>
    );
}

export function IconReviews(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 32 32" width={32} height={32} aria-hidden {...props}>
            <path {...strokeAttrs} d="M8 8h14a3 3 0 0 1 3 3v9l-4-3H8a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3Z" />
            <path {...strokeAttrs} d="M11 13h8M11 17h5" />
        </svg>
    );
}

export function IconRatingStar(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden {...props}>
            <path
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={0.5}
                strokeLinejoin="round"
                d="M12 3.2 14.1 9l6.2.5-4.7 4 1.5 6-5.1-3.1L7 19.6l1.5-6-4.7-4 6.2-.5L12 3.2Z"
            />
        </svg>
    );
}
