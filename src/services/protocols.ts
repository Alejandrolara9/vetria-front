import { api } from "./api";

// ─── Tipos ────────────────────────────────────────────────────────────────────
// Refleja exactamente el schema del backend (vaccination-protocols.schema.ts)
// Los campos de edad usan días (ageDays), no meses.

export interface VaccinationProtocol {
  id: string;
  name: string;
  vaccineType: string;
  species: string;
  breed?: string | null;
  /** Edad mínima en días (null = sin límite inferior) */
  minAgeDays?: number | null;
  /** Edad máxima en días (null = sin límite superior) */
  maxAgeDays?: number | null;
  minWeightKg?: number | null;
  /** Cada cuántos días se repite el protocolo (null = única vez) */
  intervalDays?: number | null;
  /** Días antes del vencimiento para enviar el recordatorio PRE */
  preReminderDays: number;
  /** Días después del vencimiento para enviar el seguimiento POST */
  postReminderDays: number;
  customMessage?: string | null;
  active: boolean;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProtocolDto {
  name: string;
  vaccineType: string;
  species: string;
  breed?: string;
  minAgeDays?: number;
  maxAgeDays?: number;
  minWeightKg?: number;
  intervalDays?: number;
  preReminderDays: number;
  postReminderDays: number;
  customMessage?: string;
}

export type UpdateProtocolDto = Partial<CreateProtocolDto & { active: boolean }>;

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/** Obtiene todos los protocolos del tenant (incluyendo protocolos globales del sistema) */
export async function listProtocols(): Promise<VaccinationProtocol[]> {
  const res = await api.get<VaccinationProtocol[]>("/vaccination-protocols");
  return res.data;
}

/** Obtiene un protocolo por ID */
export async function getProtocol(id: string): Promise<VaccinationProtocol> {
  const res = await api.get<VaccinationProtocol>(`/vaccination-protocols/${id}`);
  return res.data;
}

/** Crea un nuevo protocolo de vacunación */
export async function createProtocol(dto: CreateProtocolDto): Promise<VaccinationProtocol> {
  const res = await api.post<VaccinationProtocol>("/vaccination-protocols", dto);
  return res.data;
}

/** Actualiza un protocolo existente (solo protocolos propios del tenant) */
export async function updateProtocol(
  id: string,
  dto: UpdateProtocolDto
): Promise<VaccinationProtocol> {
  const res = await api.put<VaccinationProtocol>(`/vaccination-protocols/${id}`, dto);
  return res.data;
}

/** Elimina un protocolo (solo protocolos propios del tenant) */
export async function deleteProtocol(id: string): Promise<void> {
  await api.delete(`/vaccination-protocols/${id}`);
}
