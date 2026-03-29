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