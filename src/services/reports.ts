// src/services/reports.ts
import { api } from "./api";

// ─── Tipos compartidos ────────────────────────────────────────────────────────

export type ReportPeriod = "week" | "month" | "year";

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export interface DashboardStats {
  period: string;
  appointmentsCount: number;
  appointmentsByStatus: Record<string, number>;
  newClients: number;
  newPets: number;
  revenueTotal: number;
  invoicesByStatus: Record<string, number>;
  remindersStats: {
    scheduled: number;
    sent: number;
    confirmed: number;
    expired: number;
  };
  topServices: Array<{ title: string; count: number }>;
}

// ─── Informe de citas ─────────────────────────────────────────────────────────

export interface AppointmentReportItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  status: string;
  pet: { id: string; name: string; species: string } | null;
  client: { id: string; name: string; email: string } | null;
  vet: { id: string; name: string } | null;
}

export interface AppointmentsReport {
  appointments: AppointmentReportItem[];
  totals: {
    total: number;
    byStatus: Record<string, number>;
  };
}

// ─── Informe de clientes ──────────────────────────────────────────────────────

export interface ClientsReport {
  totalClients: number;
  totalPets: number;
  avgPetsPerClient: number;
  topSpecies: Array<{ species: string; count: number }>;
  topClients: Array<{
    id: string;
    name: string;
    email: string;
    petCount: number;
  }>;
  petsWithoutRecentAppointment: Array<{
    id: string;
    name: string;
    species: string;
    ownerName: string;
    lastAppointmentDate: string | null;
  }>;
}

// ─── Informe financiero ───────────────────────────────────────────────────────

export interface FinancialReportInvoice {
  id: string;
  number: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  issuedAt: string;
  paidAt: string | null;
  clientName: string;
  petName: string | null;
  itemCount: number;
}

export interface FinancialReport {
  invoices: FinancialReportInvoice[];
  totals: {
    totalIssued: number;
    totalPaid: number;
    totalPending: number;
    totalCancelled: number;
    byStatus: Record<string, number>;
  };
  revenueByPeriod: Array<{ period: string; amount: number; count: number }>;
}

// ─── Informe de inventario ────────────────────────────────────────────────────

export interface InventoryReport {
  totalActiveProducts: number;
  lowStockCount: number;
  totalStockValue: number;
  lowStockProducts: Array<{
    id: string;
    name: string;
    category: string;
    stock: number;
    minStock: number;
    unit: string;
    costPrice: number;
  }>;
  recentMovements: Array<{
    id: string;
    productName: string;
    type: string;
    quantity: number;
    reason: string | null;
    stockAfter: number;
    createdAt: string;
  }>;
  productsWithoutMovement: Array<{
    id: string;
    name: string;
    category: string;
    stock: number;
  }>;
}

// ─── Informe de recordatorios ─────────────────────────────────────────────────

export interface RemindersReport {
  byEventType: Array<{
    eventType: string;
    total: number;
    scheduled: number;
    sent: number;
    confirmed: number;
    expired: number;
  }>;
  notifications: {
    total: number;
    sent: number;
    opened: number;
    confirmed: number;
    openRate: number;
    confirmRate: number;
  };
  overallStats: {
    total: number;
    scheduled: number;
    sent: number;
    confirmed: number;
    expired: number;
    confirmationRate: number;
  };
}

// ─── Funciones de API ─────────────────────────────────────────────────────────

export async function getDashboardStats(
  period: ReportPeriod = "month"
): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/reports/dashboard", {
    params: { period },
  });
  return data;
}

export async function getAppointmentsReport(
  from: string,
  to: string
): Promise<AppointmentsReport> {
  const { data } = await api.get<AppointmentsReport>("/reports/appointments", {
    params: { from, to },
  });
  return data;
}

export async function getClientsReport(): Promise<ClientsReport> {
  const { data } = await api.get<ClientsReport>("/reports/clients");
  return data;
}

export async function getFinancialReport(
  from: string,
  to: string
): Promise<FinancialReport> {
  const { data } = await api.get<FinancialReport>("/reports/financial", {
    params: { from, to },
  });
  return data;
}

export async function getInventoryReport(): Promise<InventoryReport> {
  const { data } = await api.get<InventoryReport>("/reports/inventory");
  return data;
}

export async function getRemindersReport(
  from: string,
  to: string
): Promise<RemindersReport> {
  const { data } = await api.get<RemindersReport>("/reports/reminders", {
    params: { from, to },
  });
  return data;
}
