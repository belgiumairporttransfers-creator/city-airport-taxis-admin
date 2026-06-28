import API_ROUTES from "@/lib/api/routes";
import { api } from "./client";

export interface UploadResponse {
  url: string;
  public_id: string;
}

const uploadFileToApi = async (file: File, folder: string): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const data = await api.post<UploadResponse>(`${API_ROUTES.UPLOAD}/upload`, formData);

  if (!data?.url) {
    throw new Error("Upload failed");
  }

  return data;
};

export const uploadImage = async (
  file: File,
  folder: string = "admin-avatars"
): Promise<UploadResponse> => uploadFileToApi(file, folder);

export const uploadFile = async (
  file: File,
  folder: string = "uploads"
): Promise<UploadResponse> => uploadFileToApi(file, folder);
