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
  mustChangePassword?: boolean;
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

/**
 * Admin-only: generates a new temporary password for a user and emails it to them.
 * Returns the temporary password so the admin can see it once.
 */
export async function resetUserPassword(userId: string): Promise<{ tempPassword: string }> {
  const res = await api.post<{ tempPassword: string }>(`/users/${userId}/reset-password`);
  return res.data;
}

/**
 * Creates a new team member.
 * When sendCredentials is true the backend emails the credentials and sets mustChangePassword.
 */
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
  sendCredentials?: boolean;
}

export async function createUser(data: CreateUserDto): Promise<void> {
  await api.post("/users", data);
}

export async function uploadMySignature(file: File): Promise<{ key: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<{ key: string }>("/users/me/signature", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
