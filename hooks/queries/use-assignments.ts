import { createAssignment } from "@/lib/api/assignment";
import type { CreateAssignmentPayload } from "@/lib/schemas";
import { BOOKINGS_QUERY_KEY, bookingQueryKey } from "@/hooks/queries/use-bookings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type ApiError = { message?: string };

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => createAssignment(payload),
    onSuccess: async (assignment) => {
      toast.success("Driver assigned successfully");
      await queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
      const bookingId = assignment?.bookingId;
      if (bookingId) {
        await queryClient.invalidateQueries({
          queryKey: bookingQueryKey(bookingId),
        });
      }
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to assign driver.");
    },
  });
};
