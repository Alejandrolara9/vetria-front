import axios, { InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export const ownerApi = axios.create({ baseURL: API_URL });

ownerApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("owner_token") : null; // NOSONAR S5122 — JWT in localStorage; migration to HttpOnly cookie is tracked as a future security hardening task
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OwnerPet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  tenant: { name: string };
}

export interface PetEvent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  appliedDate: string;
  nextDueDate: string | null;
}

export interface PetNote {
  id: string;
  chiefComplaint: string | null;
  finalNote: string | null;
  approvedAt: string | null;
  tenant: { name: string };
}

export interface PetReminder {
  id: string;
  eventType: string;
  calculatedDueDate: string;
  notes: string | null;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function validateInviteToken(
  token: string
): Promise<{ email: string }> {
  const res = await ownerApi.post("/portal/auth/validate-invite", { token });
  return res.data;
}

export async function acceptInvite(data: {
  token: string;
  name: string;
  password: string;
}): Promise<{
  token: string;
  owner: { id: string; name: string; email: string };
}> {
  const res = await ownerApi.post("/portal/auth/accept-invite", data);
  return res.data;
}

export async function ownerLogin(data: {
  email: string;
  password: string;
}): Promise<{
  token: string;
  owner: { id: string; name: string; email: string };
}> {
  const res = await ownerApi.post("/portal/auth/login", data);
  return res.data;
}

export async function ownerGoogleAuth(idToken: string): Promise<{
  token: string;
  owner: { id: string; name: string; email: string };
}> {
  const res = await ownerApi.post("/portal/auth/google", { idToken });
  return res.data;
}

// ─── Portal ───────────────────────────────────────────────────────────────────

export async function getOwnerPets(): Promise<OwnerPet[]> {
  const res = await ownerApi.get("/portal/pets");
  return res.data;
}

export async function getPetEvents(petId: string): Promise<PetEvent[]> {
  const res = await ownerApi.get(`/portal/pets/${petId}/events`);
  return res.data;
}

export async function getPetNotes(petId: string): Promise<PetNote[]> {
  const res = await ownerApi.get(`/portal/pets/${petId}/notes`);
  return res.data;
}

export async function getPetReminders(petId: string): Promise<PetReminder[]> {
  const res = await ownerApi.get(`/portal/pets/${petId}/reminders`);
  return res.data;
}

export async function inviteClientToPortal(
  clientId: string
): Promise<{ message: string }> {
  const { api } = await import("./api");
  const res = await api.post(`/users/clients/${clientId}/invite-owner`);
  return res.data;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function saveOwnerToken(token: string) {
  localStorage.setItem("owner_token", token);
}

export function clearOwnerToken() {
  localStorage.removeItem("owner_token");
}

export function getOwnerToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("owner_token")
    : null;
}

/**
 * Traduce el tipo de evento veterinario a una etiqueta legible en español.
 * Los valores del enum provienen del backend (EventType en Prisma).
 */
export function translateEventType(type: string): string {
  const map: Record<string, string> = {
    VACCINE: "Vacunación",
    DEWORMING: "Desparasitación",
    ANTIPARASITIC: "Antiparasitario",
    CHECKUP: "Control",
    OTHER: "Atención veterinaria",
  };
  return map[type] ?? type;
}
