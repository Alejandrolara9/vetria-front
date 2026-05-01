import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  signatureUrl: string | null;
  licenseNumber: string | null;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Obtiene el perfil del usuario autenticado desde el backend.
 * Nota: El endpoint GET /users/me puede no existir aún en el backend.
 * El error se maneja gracefully en el componente consumidor.
 */
export async function getMyProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/users/me");
  return res.data;
}

export async function updateMyProfile(data: { licenseNumber?: string }): Promise<UserProfile> {
  const res = await api.patch<UserProfile>("/users/me/profile", data);
  return res.data;
}

export async function uploadMySignature(file: File): Promise<{ key: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<{ key: string }>("/users/me/signature", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
