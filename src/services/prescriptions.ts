import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PrescriptionStatus = "DRAFT" | "SENT" | "PRINTED";

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  productId: string | null;
  productName: string;
  quantity: string;
  instructions: string;
  order: number;
}

export interface Prescription {
  id: string;
  tenantId: string;
  petId: string;
  vetId: string;
  issueDate: string;
  nextControlDate: string | null;
  observations: string | null;
  status: PrescriptionStatus;
  pdfUrl: string | null;
  emailSentAt: string | null;
  reminderId: string | null;
  createdAt: string;
  updatedAt: string;
  items: PrescriptionItem[];
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    birthDate: string | null;
    client: { id: string; name: string; phone: string; email: string };
  };
  vet: {
    id: string;
    name: string;
    signatureUrl: string | null;
    licenseNumber: string | null;
  };
  tenant: {
    id: string;
    name: string;
    logoUrl: string | null;
    primaryColor: string | null;
    clinicPhone: string | null;
    clinicAddress: string | null;
    clinicCity: string | null;
  };
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface PrescriptionItemInput {
  productId?: string;
  productName: string;
  quantity: string;
  instructions: string;
  order: number;
}

export interface CreatePrescriptionDto {
  petId: string;
  issueDate?: string;
  nextControlDate?: string;
  observations?: string;
  items: PrescriptionItemInput[];
}

export interface UpdatePrescriptionDto {
  nextControlDate?: string | null;
  observations?: string;
  items?: PrescriptionItemInput[];
}

export interface ListPrescriptionsFilters {
  petId?: string;
  vetId?: string;
  status?: PrescriptionStatus;
  from?: string;
  to?: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function listPrescriptions(
  filters?: ListPrescriptionsFilters
): Promise<Prescription[]> {
  const params = new URLSearchParams();
  if (filters?.petId) params.append("petId", filters.petId);
  if (filters?.vetId) params.append("vetId", filters.vetId);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.from) params.append("from", filters.from);
  if (filters?.to) params.append("to", filters.to);
  const qs = params.toString();
  const res = await api.get<Prescription[]>(`/prescriptions${qs ? `?${qs}` : ""}`);
  return res.data;
}

export async function getPrescription(id: string): Promise<Prescription> {
  const res = await api.get<Prescription>(`/prescriptions/${id}`);
  return res.data;
}

export async function createPrescription(
  data: CreatePrescriptionDto
): Promise<Prescription> {
  const res = await api.post<Prescription>("/prescriptions", data);
  return res.data;
}

export async function updatePrescription(
  id: string,
  data: UpdatePrescriptionDto
): Promise<Prescription> {
  const res = await api.patch<Prescription>(`/prescriptions/${id}`, data);
  return res.data;
}

export async function deletePrescription(id: string): Promise<void> {
  await api.delete(`/prescriptions/${id}`);
}

export async function generatePdf(id: string): Promise<Prescription> {
  const res = await api.post<Prescription>(`/prescriptions/${id}/pdf`);
  return res.data;
}

export async function sendPrescription(id: string): Promise<Prescription> {
  const res = await api.post<Prescription>(`/prescriptions/${id}/send`);
  return res.data;
}
