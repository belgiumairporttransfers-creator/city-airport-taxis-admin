import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
} from "axios";
import API_ROUTES from "@/lib/api/routes";
import { captureCsrfToken, getCsrfToken } from "@/lib/api/csrf";

export { clearCsrfToken } from "@/lib/api/csrf";

const baseURL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:5000/api" : undefined);

if (!baseURL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured.");
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export type ApiResponse<T = unknown> = {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        pages?: number;
    };
};

export type ApiError = {
    message: string;
    status?: number;
};

const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

const unwrapResponse = <T>(response: AxiosResponse): T | undefined => {
    if (response.config.responseType === "blob") {
        return response.data as T;
    }

    const body = response.data as ApiResponse<T>;
    return body.data;
};

axiosInstance.interceptors.request.use((config) => {
    const method = config.method?.toUpperCase();

    if (method && !SAFE_METHODS.has(method)) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            config.headers.set("X-CSRF-Token", csrfToken);
        }
    }

    return config;
});

let isRefreshing = false;
let refreshPromise: Promise<unknown> | null = null;

type RetriableConfig = {
    _retry?: boolean;
};

const shouldSkipRefresh = (url?: string) => {
    if (!url) return true;
    return (
        url.includes(API_ROUTES.AUTH_REFRESH) ||
        url.includes(API_ROUTES.AUTH_LOGIN)
    );
};

axiosInstance.interceptors.response.use(
    (response) => {
        captureCsrfToken(response.headers);
        return unwrapResponse(response) as unknown as typeof response;
    },
    async (error: AxiosError<{ error?: string; message?: string }>) => {
        if (error.response?.headers) {
            captureCsrfToken(error.response.headers);
        }

        const originalRequest = error.config as (typeof error.config & RetriableConfig) | undefined;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !shouldSkipRefresh(originalRequest.url)
        ) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = axiosInstance.post(API_ROUTES.AUTH_REFRESH, {});
            }

            try {
                await refreshPromise;
                return axiosInstance(originalRequest);
            } catch {
                // If refresh fails, fall through to normalized 401 error.
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        }

        const message =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Something went wrong";

        return Promise.reject({
            message,
            status: error.response?.status,
        } satisfies ApiError);
    }
);

const request = <T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T | undefined> => {
    switch (method) {
        case "get":
            return axiosInstance.get(url, config);
        case "post":
            return axiosInstance.post(url, data, config);
        case "put":
            return axiosInstance.put(url, data, config);
        case "patch":
            return axiosInstance.patch(url, data, config);
        case "delete":
            return axiosInstance.delete(url, config);
    }
};

export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) => request<T>("get", url, undefined, config),
    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        request<T>("post", url, data, config),
    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        request<T>("put", url, data, config),
    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        request<T>("patch", url, data, config),
    delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>("delete", url, undefined, config),
};
