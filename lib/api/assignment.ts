import API_ROUTES from "@/lib/api/routes";
import type { Assignment, CreateAssignmentPayload } from "@/lib/schemas";
import { api } from "./client";

export const createAssignment = async (payload: CreateAssignmentPayload) => {
  return api.post<Assignment>(API_ROUTES.ASSIGNMENTS, payload);
};
