export interface SpringPageMetadata {
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface SpringPage<T> extends SpringPageMetadata {
    content: T[];
}

export function normalizeSpringPage<TRaw, T>(
    page: {
        content?: TRaw[];
        totalPages?: number;
        totalElements?: number;
        size?: number;
        number?: number;
        first?: boolean;
        last?: boolean;
        empty?: boolean;
    },
    normalizeItem: (raw: TRaw) => T | null,
    fallbackPageNumber: number,
    defaultPageSize: number,
): SpringPage<T> {
    const content = (page.content ?? []).flatMap((raw) => {
        const item = normalizeItem(raw);
        return item ? [item] : [];
    });

    return {
        content,
        totalPages: page.totalPages ?? 0,
        totalElements: page.totalElements ?? 0,
        size: page.size ?? defaultPageSize,
        number: page.number ?? fallbackPageNumber,
        first: page.first ?? fallbackPageNumber === 0,
        last: page.last ?? false,
        empty: page.empty ?? content.length === 0,
    };
}

export interface Ownable {
    ownerId: string | null;
    ownerUsername: string | null;
}

export function canManage(
    resource: Ownable,
    actor: { userId?: string | null; displayName?: string | null } | null,
): boolean {
    if (!actor) return false;
    if (actor.userId && resource.ownerId) return actor.userId === resource.ownerId;
    if (actor.displayName && resource.ownerUsername) return actor.displayName === resource.ownerUsername;
    return false;
}