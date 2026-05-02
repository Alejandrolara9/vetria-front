import { api } from "./api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  signatureUrl: string | null;
  licenseNumber: string | null;
  hasPassword: boolean;
}

export async function getMyProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/users/me");
  return res.data;
}

export async function updateMyProfile(data: { licenseNumber?: string }): Promise<UserProfile> {
  const res = await api.patch<UserProfile>("/users/me/profile", data);
  return res.data;
}

export async function setMyPassword(data: {
  currentPassword?: string;
  newPassword: string;
}): Promise<void> {
  await api.patch("/users/me/password", data);
}

export async function uploadMySignature(file: File): Promise<{ key: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<{ key: string }>("/users/me/signature", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
