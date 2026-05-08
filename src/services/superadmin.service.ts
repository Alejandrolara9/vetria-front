import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export const superAdminApi = axios.create({ baseURL: BASE_URL });

superAdminApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("superadmin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

superAdminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("superadmin_token");
      window.location.href = "/superadmin/login";
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
