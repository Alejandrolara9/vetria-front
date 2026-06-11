import { api } from "./api";

export interface TenantCredits {
  creditBalance:          number;
  plan:                   "FREE" | "BASIC" | "PRO";
  trialEndsAt:            string | null;
  creditsRefreshedAt:     string | null;
  gracePeriodEndsAt:      string | null;
  planPeriodEndsAt:       string | null;
  billingPeriod:          "MONTHLY" | "SEMESTER" | "ANNUAL" | null;
  mpSubscriptionId:       string | null;
  founderPromo:           boolean;
  founderCyclesRemaining: number | null;
  wasFounder:             boolean;
}

export interface CreditTopUpRequest {
  id: string;
  credits: number;
  paidAmountCOP: number;
}

export const CREDIT_PACKS = [
  { credits: 50, priceCOP: 20_000 },
  { credits: 150, priceCOP: 50_000 },
] as const;

export async function fetchMyCredits(): Promise<TenantCredits> {
  const res = await api.get<TenantCredits>("/users/tenants/me/credits");
  return res.data;
}

export async function requestCreditTopUp(packIndex: number): Promise<CreditTopUpRequest> {
  const res = await api.post<CreditTopUpRequest>("/users/tenants/me/credit-request", { packIndex });
  return res.data;
}
