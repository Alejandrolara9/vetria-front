// src/services/invoices.ts
import { api } from "./api";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceClient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface InvoicePet {
  id: string;
  name: string;
  species: string;
  breed?: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  clientId: string;
  petId: string | null;
  number: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: InvoiceClient;
  pet: InvoicePet | null;
  items: InvoiceItem[];
}

export interface InvoiceStats {
  total: number;
  draft: number;
  issued: number;
  paid: number;
  cancelled: number;
  totalRevenue: number;
}

export interface CreateInvoiceItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceDto {
  clientId: string;
  petId?: string;
  items: CreateInvoiceItemDto[];
  notes?: string;
  dueAt?: string;
  tax?: number;
}

export interface UpdateInvoiceDto {
  status?: InvoiceStatus;
  notes?: string;
  dueAt?: string;
  paidAt?: string;
}

// ─── Funciones de servicio ───────────────────────────────────────────────────

export async function getInvoices(filters?: {
  status?: InvoiceStatus;
  clientId?: string;
}): Promise<Invoice[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.clientId) params.append("clientId", filters.clientId);

  const res = await api.get<Invoice[]>(`/invoices?${params.toString()}`);
  return res.data;
}

export async function getInvoiceStats(): Promise<InvoiceStats> {
  const res = await api.get<InvoiceStats>("/invoices/stats");
  return res.data;
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  const res = await api.get<Invoice>(`/invoices/${id}`);
  return res.data;
}

export async function createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
  const res = await api.post<Invoice>("/invoices", data);
  return res.data;
}

export async function updateInvoice(
  id: string,
  data: UpdateInvoiceDto
): Promise<Invoice> {
  const res = await api.put<Invoice>(`/invoices/${id}`, data);
  return res.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/invoices/${id}`);
}
