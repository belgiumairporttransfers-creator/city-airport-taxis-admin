import API_ROUTES from "@/lib/api/routes";
import type { SettingsSchema, Settings } from "@/lib/schemas";
import { api } from "./client";

export const getSettings = async () => {
  return api.get<Settings>(API_ROUTES.SETTINGS);
};

export const updateSettings = async (payload: SettingsSchema) => {
  return api.post(API_ROUTES.SETTINGS, payload);
};
