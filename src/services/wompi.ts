import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (globalThis.window !== undefined) {
    const token = localStorage.getItem("token"); // NOSONAR S5122
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type PlanTarget = "BASIC" | "PRO";

export const PLAN_PRICES: Record<PlanTarget, number> = {
  BASIC: 100_000,
  PRO: 250_000,
};

export const PLAN_LABELS: Record<PlanTarget, string> = {
  BASIC: "Plan Basic",
  PRO: "Plan Pro",
};

export async function initiateCheckout(plan: PlanTarget): Promise<{ checkoutUrl: string; reference: string }> {
  const res = await api.post("/wompi/checkout", { plan });
  return res.data;
}

export async function getTransactionStatus(reference: string): Promise<{
  status: string;
  plan: string;
  confirmedAt: string | null;
}> {
  const res = await api.get(`/wompi/transaction/${reference}`);
  return res.data;
}
