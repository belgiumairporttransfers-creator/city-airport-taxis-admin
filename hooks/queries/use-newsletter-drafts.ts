import {
  bulkDeleteNewsletterDrafts,
  createNewsletterDraft,
  deleteNewsletterDraft,
  getNewsletterDraft,
  getNewsletterDrafts,
  updateNewsletterDraft,
} from "@/lib/api/newsletter-draft";
import type { GetNewsletterDraftsParams, SaveNewsletterDraftPayload } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const NEWSLETTER_DRAFTS_QUERY_KEY = ["newsletter-drafts"] as const;
type ApiError = { message?: string };

export const useNewsletterDrafts = (params: GetNewsletterDraftsParams) => {
  return useQuery({
    queryKey: [...NEWSLETTER_DRAFTS_QUERY_KEY, params],
    queryFn: () => getNewsletterDrafts(params),
    staleTime: 1000 * 30,
  });
};

export const useNewsletterDraft = (id?: string) => {
  return useQuery({
    queryKey: [...NEWSLETTER_DRAFTS_QUERY_KEY, id],
    queryFn: () => getNewsletterDraft(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
};

export const useCreateNewsletterDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNewsletterDraft,
    onSuccess: async () => {
      toast.success("Newsletter draft saved successfully");
      await queryClient.invalidateQueries({ queryKey: NEWSLETTER_DRAFTS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to save draft.");
    },
  });
};

export const useUpdateNewsletterDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveNewsletterDraftPayload }) =>
      updateNewsletterDraft(id, payload),
    onSuccess: async () => {
      toast.success("Newsletter draft updated successfully");
      await queryClient.invalidateQueries({ queryKey: NEWSLETTER_DRAFTS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update draft.");
    },
  });
};

export const useDeleteNewsletterDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNewsletterDraft,
    onSuccess: async () => {
      toast.success("Draft deleted successfully");
      await queryClient.invalidateQueries({ queryKey: NEWSLETTER_DRAFTS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete draft.");
    },
  });
};

export const useBulkDeleteNewsletterDrafts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteNewsletterDrafts,
    onSuccess: async (_, ids) => {
      toast.success(
        ids.length === 1
          ? "Draft deleted successfully"
          : `${ids.length} drafts deleted successfully`
      );
      await queryClient.invalidateQueries({ queryKey: NEWSLETTER_DRAFTS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete drafts.");
    },
  });
};
