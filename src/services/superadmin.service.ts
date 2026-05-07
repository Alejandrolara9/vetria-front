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
