import { api } from "./api";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export type AppointmentType =
  | "CONSULTATION"
  | "VACCINATION"
  | "SURGERY"
  | "GROOMING"
  | "CHECKUP"
  | "EMERGENCY"
  | "OTHER";

export interface Appointment {
  id: string;
  petId: string;
  clientId: string;
  vetId: string;
  title: string;
  date: string;         // ISO date
  startTime: string;    // HH:mm
  endTime: string;      // HH:mm
  status: AppointmentStatus;
  notes: string | null;
  cancelReason: string | null;
  pet: { id: string; name: string; species: string };
  client: { id: string; name: string };
  vet: { id: string; name: string };
  createdAt: string;
}

export interface CreateAppointmentDto {
  petId: string;
  clientId: string;
  vetId: string;
  title: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  notes?: string;
}

export interface UpdateAppointmentDto {
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  vetId?: string;
  notes?: string;
  status?: AppointmentStatus;
  cancelReason?: string;
}

export interface AppointmentStats {
  total: number;
  confirmed: number;
  completed: number;
  pending: number;
}

export interface ListAppointmentsQuery {
  date?: string;
  vetId?: string;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
}

export async function createAppointment(data: CreateAppointmentDto): Promise<Appointment> {
  const res = await api.post<Appointment>("/appointments", data);
  return res.data;
}

export async function listAppointments(query?: ListAppointmentsQuery): Promise<Appointment[]> {
  const res = await api.get<Appointment[]>("/appointments", { params: query });
  return res.data;
}

export async function getAppointmentStatsToday(): Promise<AppointmentStats> {
  const res = await api.get<AppointmentStats>("/appointments/stats/today");
  return res.data;
}

export async function getVetSchedule(vetId: string, date: string): Promise<Appointment[]> {
  const res = await api.get<Appointment[]>(`/appointments/vet/${vetId}/schedule`, {
    params: { date },
  });
  return res.data;
}

export async function getAppointment(id: string): Promise<Appointment> {
  const res = await api.get<Appointment>(`/appointments/${id}`);
  return res.data;
}

export async function updateAppointment(id: string, data: UpdateAppointmentDto): Promise<Appointment> {
  const res = await api.put<Appointment>(`/appointments/${id}`, data);
  return res.data;
}

export async function cancelAppointment(id: string, reason: string): Promise<Appointment> {
  const res = await api.patch<Appointment>(`/appointments/${id}/cancel`, { reason });
  return res.data;
}

export async function confirmAppointment(id: string): Promise<Appointment> {
  const res = await api.patch<Appointment>(`/appointments/${id}/confirm`, {});
  return res.data;
}

export async function completeAppointment(id: string): Promise<Appointment> {
  const res = await api.patch<Appointment>(`/appointments/${id}/complete`, {});
  return res.data;
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`);
}
