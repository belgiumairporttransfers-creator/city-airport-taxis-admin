import type { AxiosResponse } from "axios";

const CSRF_STORAGE_KEY = "csrfToken";

const getCookie = (name: string): string | undefined => {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : undefined;
};

let inMemoryCsrfToken: string | undefined;

export const persistCsrfToken = (token: string): void => {
    inMemoryCsrfToken = token;
    if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(CSRF_STORAGE_KEY, token);
    }
};

export const captureCsrfToken = (headers: AxiosResponse["headers"]): void => {
    const token = headers["x-csrf-token"];
    if (typeof token === "string" && token.length > 0) {
        persistCsrfToken(token);
    }
};

export const getCsrfToken = (): string | undefined => {
    if (typeof sessionStorage !== "undefined") {
        const stored = sessionStorage.getItem(CSRF_STORAGE_KEY);
        if (stored) return stored;
    }

    return getCookie("csrfToken") || inMemoryCsrfToken;
};

export const clearCsrfToken = (): void => {
    inMemoryCsrfToken = undefined;
    if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(CSRF_STORAGE_KEY);
    }
};
