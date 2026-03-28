import { isAxiosError } from 'axios';

export interface ApiErrorBody {
    message?: string;
    errors?: Record<string, string | string[]>;
}

export function getApiErrorBody(error: unknown): ApiErrorBody | null {
    if (!isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') {
        return null;
    }

    return error.response.data as ApiErrorBody;
}

export function getApiFieldErrors(error: unknown): Record<string, string> {
    const body = getApiErrorBody(error);
    if (!body?.errors) {
        return {};
    }

    return Object.entries(body.errors).reduce<Record<string, string>>((fieldErrors, [field, rawMessage]) => {
        const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
        if (typeof message === 'string' && message.trim()) {
            fieldErrors[field] = message;
        }
        return fieldErrors;
    }, {});
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    const body = getApiErrorBody(error);
    if (body?.message && body.message.trim()) {
        return body.message;
    }

    return fallback;
}