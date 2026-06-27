import {
    login,
    forgotPassword,
    resetPassword,
    logout,
    me,
    updateProfile,
    changePassword,
    getActivities,
    getSessions,
    revokeSession,
    logoutAllDevices,
} from "@/lib/api/auth";
import { clearCsrfToken } from "@/lib/api/csrf";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;
export const AUTH_ACTIVITIES_QUERY_KEY = ["auth", "activities"] as const;
export const AUTH_SESSIONS_QUERY_KEY = ["auth", "sessions"] as const;

type ApiError = { message?: string };

export const useAuthLogin = () => {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");

    return useMutation({
        mutationFn: login,
        onSuccess: async () => {
            toast.success("Logged in successfully!");
            await queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
            const redirectPath = callbackUrl || "/dashboard";
            window.location.assign(redirectPath);
        },
        onError: (error: ApiError) => {
            const message = error?.message || "Failed to log in. Please check your credentials.";
            toast.error(message);
        },
    });
};

export const useAuthForgotPassword = () => {
    return useMutation({
        mutationFn: forgotPassword,
        onSuccess: () => {
            toast.success("Reset link sent to your email!");
        },
        onError: (error: ApiError) => {
            const message = error?.message || "Failed to send reset link. Please try again.";
            toast.error(message);
        },
    });
};

export const useAuthResetPassword = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            toast.success("Password reset successfully! You can now log in.");
            router.push("/auth/login");
        },
        onError: (error: ApiError) => {
            const message = error?.message || "Failed to reset password. Please try again.";
            toast.error(message);
        },
    });
};

export const useAuthLogout = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: logout,
        onSuccess: async () => {
            clearCsrfToken();
            queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
            toast.success("Logged out successfully.");
            router.push("/auth/login");
        },
        onError: (error: ApiError) => {
            const message = error?.message || "Failed to log out. Please try again.";
            toast.error(message);
        },
    });
};

export const useAuthMe = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: AUTH_ME_QUERY_KEY,
        queryFn: me,
        staleTime: 1000 * 60 * 5,
        retry: false,
        refetchOnWindowFocus: false,
        enabled: options?.enabled ?? true,
    });
};

export const useAuthUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: async () => {
            toast.success("Profile updated successfully!");
            void queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
            void queryClient.invalidateQueries({ queryKey: AUTH_ACTIVITIES_QUERY_KEY });
        },
        onError: (error: ApiError) => {
            const message = error?.message || "Failed to update profile. Please try again.";
            toast.error(message);
        },
    });
};

export const useAuthChangePassword = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: changePassword,
        onSuccess: async () => {
            queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
            void queryClient.invalidateQueries({ queryKey: AUTH_ACTIVITIES_QUERY_KEY });
            toast.success("Password changed successfully! Please log in again.");
            router.push("/auth/login");
        },
        onError: (error: ApiError) => {
            const message =
                error?.message || "Failed to change password. Please check your current password.";
            toast.error(message);
        },
    });
};

export const useAuthActivities = (params: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: [AUTH_ACTIVITIES_QUERY_KEY, params],
        queryFn: () => getActivities(params),
        staleTime: 1000 * 60,
    });
};

export const useAuthSessions = (params: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: [AUTH_SESSIONS_QUERY_KEY, params],
        queryFn: () => getSessions(params),
        staleTime: 1000 * 30,
    });
};

export const useAuthRevokeSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: revokeSession,
        onSuccess: async () => {
            toast.success("Device logged out successfully.");
            void queryClient.invalidateQueries({ queryKey: AUTH_SESSIONS_QUERY_KEY });
            void queryClient.invalidateQueries({ queryKey: AUTH_ACTIVITIES_QUERY_KEY });
        },
        onError: (error: ApiError) => {
            toast.error(error?.message || "Failed to log out device.");
        },
    });
};

export const useAuthLogoutAllDevices = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: logoutAllDevices,
        onSuccess: async () => {
            queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
            queryClient.removeQueries({ queryKey: AUTH_SESSIONS_QUERY_KEY });
            queryClient.removeQueries({ queryKey: AUTH_ACTIVITIES_QUERY_KEY });
            toast.success("Logged out from all devices.");
            router.push("/auth/login");
        },
        onError: (error: ApiError) => {
            toast.error(error?.message || "Failed to log out from all devices.");
        },
    });
};
