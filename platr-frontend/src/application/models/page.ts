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
    data: {
        content?: TRaw[];
        totalPages?: number;
        totalElements?: number;
        size?: number;
        number?: number;
        first?: boolean;
        last?: boolean;
        empty?: boolean;
        page?: {
            size?: number;
            totalElements?: number;
            totalPages?: number;
            number?: number;
        };
    },
    normalizeItem: (raw: TRaw) => T | null,
    fallbackPageNumber: number,
    defaultPageSize: number,
): SpringPage<T> {
    const content = (data.content ?? []).flatMap((raw) => {
        const item = normalizeItem(raw);
        return item ? [item] : [];
    });

    // Handle both direct PageImpl fields and the Spring Boot 3.3.x PagedModel format
    const totalPages = data.page?.totalPages ?? data.totalPages ?? 0;
    const totalElements = data.page?.totalElements ?? data.totalElements ?? 0;
    const size = data.page?.size ?? data.size ?? defaultPageSize;
    const number = data.page?.number ?? data.number ?? fallbackPageNumber;
    
    // In PagedModel, first and last aren't explicitly provided, so we derive them
    const first = data.first ?? number === 0;
    const last = data.last ?? (totalPages > 0 ? number === totalPages - 1 : false);

    return {
        content,
        totalPages,
        totalElements,
        size,
        number,
        first,
        last,
        empty: data.empty ?? content.length === 0,
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