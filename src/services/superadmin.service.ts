import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export const superAdminApi = axios.create({ baseURL: BASE_URL });

superAdminApi.interceptors.request.use((config) => {
  if (globalThis.window !== undefined) {
    const token = localStorage.getItem("superadmin_token"); // NOSONAR S5122 — JWT in localStorage; migration to HttpOnly cookie is tracked as a future security hardening task
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

superAdminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && globalThis.window !== undefined) {
      localStorage.removeItem("superadmin_token");
      globalThis.window.location.replace("/superadmin/login"); // NOSONAR S5122 — hardcoded path, no user input involved
    }
    return Promise.reject(error);
  }
);

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  plan: "FREE" | "BASIC" | "PRO";
  active: boolean;
  createdAt: string;
  clinicDepartment: string | null;
  clinicCity: string | null;
  creditBalance: number | null;
  gracePeriodEndsAt: string | null;
  _count: { users: number; pets: number; appointments: number };
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalPets: number;
  planBreakdown: { FREE: number; BASIC: number; PRO: number };
}

export async function superAdminLogin(email: string, password: string): Promise<string> {
  const res = await superAdminApi.post("/superadmin/login", { email, password });
  return res.data.token;
}

export async function fetchTenants(): Promise<TenantSummary[]> {
  const res = await superAdminApi.get("/superadmin/tenants");
  return res.data;
}

export async function updateTenant(
  id: string,
  data: { active?: boolean; plan?: "FREE" | "BASIC" | "PRO" }
): Promise<TenantSummary> {
  const res = await superAdminApi.patch(`/superadmin/tenants/${id}`, data);
  return res.data;
}

export async function fetchTenantUsers(tenantId: string): Promise<TenantUser[]> {
  const res = await superAdminApi.get(`/superadmin/tenants/${tenantId}/users`);
  return res.data;
}

export async function fetchStats(): Promise<PlatformStats> {
  const res = await superAdminApi.get("/superadmin/stats");
  return res.data;
}

export async function changeSuperAdminPassword(newPassword: string): Promise<void> {
  await superAdminApi.patch("/superadmin/me/password", { newPassword });
}

export interface CreditRequest {
  id: string;
  tenantId: string;
  credits: number;
  paidAmountCOP: number;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    plan: string;
    creditBalance: number;
  };
}

export async function fetchCreditRequests(): Promise<CreditRequest[]> {
  const res = await superAdminApi.get("/superadmin/credit-requests");
  return res.data;
}

export async function confirmCreditRequest(reqId: string): Promise<{ creditBalance: number }> {
  const res = await superAdminApi.post(`/superadmin/credit-requests/${reqId}/confirm`);
  return res.data;
}

export async function rejectCreditRequest(reqId: string): Promise<void> {
  await superAdminApi.delete(`/superadmin/credit-requests/${reqId}`);
}

export async function addCreditsAdmin(
  tenantId: string,
  credits: number,
  reason?: string
): Promise<{ creditBalance: number }> {
  const res = await superAdminApi.post(`/superadmin/tenants/${tenantId}/credits`, {
    credits,
    reason,
  });
  return res.data;
}

export async function setGracePeriod(tenantId: string, days: number): Promise<TenantSummary> {
  const res = await superAdminApi.patch(`/superadmin/tenants/${tenantId}/grace-period`, { days });
  return res.data;
}

export async function reactivateTenant(
  id: string,
  days: 7 | 14 | 30
): Promise<TenantSummary> {
  const res = await superAdminApi.post(
    `/superadmin/tenants/${id}/reactivate`,
    { days }
  );
  return res.data;
}

export interface FeedbackItem {
  id: string;
  name: string;
  email: string | null;
  message: string;
  rating: number;
  createdAt: string;
}

export async function fetchFeedback(): Promise<FeedbackItem[]> {
  const res = await superAdminApi.get("/feedback");
  return res.data;
}

export async function submitFeedback(data: {
  name: string;
  email?: string;
  message: string;
  rating: number;
}): Promise<void> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
  await fetch(`${BASE_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? "Error al enviar feedback");
    }
  });
}
