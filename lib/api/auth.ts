import API_ROUTES from "@/lib/api/routes";
import type {
    AdminProfile,
    ChangePasswordSchema,
    ForgotSchema,
    LoginSchema,
    ResetPasswordSchema,
    UpdateProfileSchema,
    GetActivitiesParams,
    GetSessionsParams,
    ActivitiesResponse,
    SessionsResponse,
} from "@/lib/schemas";
import { api } from "./client";

export const login = async (payload: LoginSchema) => {
    return api.post(API_ROUTES.AUTH_LOGIN, payload);
};

export const logout = async () => {
    return api.post(API_ROUTES.AUTH_LOGOUT);
};

export const forgotPassword = async (payload: ForgotSchema) => {
    return api.post(API_ROUTES.AUTH_FORGOT_PASSWORD, payload);
};

export const resetPassword = async (payload: ResetPasswordSchema) => {
    return api.post(API_ROUTES.AUTH_RESET_PASSWORD, payload);
};

export const refreshToken = async () => {
    return api.post(API_ROUTES.AUTH_REFRESH, {});
};

export const me = async (): Promise<AdminProfile | undefined> => {
    return api.get<AdminProfile>(API_ROUTES.AUTH_ME);
};

export const updateProfile = async (payload: UpdateProfileSchema) => {
    return api.post(API_ROUTES.AUTH_UPDATE_PROFILE, payload);
};

export const changePassword = async (payload: ChangePasswordSchema) => {
    return api.post(API_ROUTES.AUTH_CHANGE_PASSWORD, payload);
};

export const getActivities = async (params?: GetActivitiesParams) => {
    return api.get<ActivitiesResponse>(API_ROUTES.AUTH_ACTIVITIES, { params });
};

export const getSessions = async (params?: GetSessionsParams) => {
    return api.get<SessionsResponse>(API_ROUTES.AUTH_SESSIONS, { params });
};

export const revokeSession = async (sessionId: string) => {
    return api.delete(API_ROUTES.AUTH_SESSIONS + `/${sessionId}`);
};

export const logoutAllDevices = async () => {
    return api.post(API_ROUTES.AUTH_LOGOUT_ALL);
};
