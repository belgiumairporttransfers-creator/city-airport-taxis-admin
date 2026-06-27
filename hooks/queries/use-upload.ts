import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "@/lib/api/upload";
import toast from "react-hot-toast";

const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_UPLOAD_FILE_SIZE_LABEL = "10 MB";

const getFileTooLargeMessage = () =>
  `File is too large. Maximum upload size is ${MAX_UPLOAD_FILE_SIZE_LABEL}.`;

export const useUpload = () => {
  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        throw { message: getFileTooLargeMessage(), status: 413 };
      }
      return uploadFile(file, folder);
    },
    onError: (error: { message?: string; status?: number }) => {
      if (error?.status === 413) {
        toast.error(getFileTooLargeMessage());
        return;
      }
      if (!error?.status) {
        toast.error(
          `Upload failed. Please ensure your file is under ${MAX_UPLOAD_FILE_SIZE_LABEL} and try again.`
        );
        return;
      }
      toast.error(error.message || "Failed to upload file");
    },
  });
};
