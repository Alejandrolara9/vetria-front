import { api } from "./api";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ReminderEventType =
  | "VACCINE"
  | "DEWORMING"
  | "ANTIPARASITIC"
  | "CHECKUP"
  | "OTHER";

export type ReminderStatus =
  | "SCHEDULED"
  | "SENT"
  | "CONFIRMED"
  | "EXPIRED"
  | "CANCELLED";

export type NotificationStage = "PRE_DUE" | "ON_DUE" | "POST_DUE";
export type NotificationChannel = "EMAIL" | "SMS" | "PUSH" | "WHATSAPP";
export type NotificationStatus = "PENDING" | "SENT" | "OPENED" | "CONFIRMED" | "FAILED";

export interface ReminderNotification {
  id: string;
  reminderId: string;
  stage: NotificationStage;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledAt: string;
  sentAt?: string;
  openedAt?: string;
  confirmedAt?: string;
}

export interface Reminder {
  id: string;
  petId: string;
  eventType: ReminderEventType;
  status: ReminderStatus;
  calculatedDueDate: string;
  petWeightKg?: number;
  clinicalEventId?: string;
  protocolId?: string;
  pet?: {
    id: string;
    name: string;
    species: string;
    client?: { id: string; name: string };
  };
  notifications?: ReminderNotification[];
  createdAt: string;
  updatedAt: string;
}

export interface ReminderStats {
  total: number;
  upcoming: number;
  overdue: number;
  notificationsSentToday: number;
}

export interface CreateReminderDto {
  petId: string;
  eventType: ReminderEventType;
  calculatedDueDate: string;
  petWeightKg?: number;
}

export interface UpdateReminderDto {
  status?: ReminderStatus;
  preferredSendHour?: number;
  preferredSendDay?: number;
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/** Crea un nuevo recordatorio para una mascota. */
export async function createReminder(dto: CreateReminderDto): Promise<Reminder> {
  const res = await api.post<Reminder>("/reminders", dto);
  return res.data;
}

/** Lista todos los recordatorios, opcionalmente filtrados por status. */
export async function listReminders(status?: ReminderStatus): Promise<Reminder[]> {
  const params = status ? { status } : {};
  const res = await api.get<Reminder[]>("/reminders", { params });
  return res.data;
}

/** Estadísticas generales de recordatorios del tenant. */
export async function getReminderStats(): Promise<ReminderStats> {
  const res = await api.get<ReminderStats>("/reminders/stats");
  return res.data;
}

/** Recordatorios próximos en los siguientes N días (default 7). */
export async function getUpcomingReminders(days = 7): Promise<Reminder[]> {
  const res = await api.get<Reminder[]>("/reminders/upcoming", { params: { days } });
  return res.data;
}

/** Recordatorios vencidos sin atender. */
export async function getOverdueReminders(): Promise<Reminder[]> {
  const res = await api.get<Reminder[]>("/reminders/overdue");
  return res.data;
}

/** Detalle de un recordatorio por id. */
export async function getReminderById(id: string): Promise<Reminder> {
  const res = await api.get<Reminder>(`/reminders/${id}`);
  return res.data;
}

/** Actualiza el status o preferencias de envío de un recordatorio. */
export async function updateReminder(id: string, dto: UpdateReminderDto): Promise<Reminder> {
  const res = await api.put<Reminder>(`/reminders/${id}`, dto);
  return res.data;
}

/** Lista todas las notificaciones del tenant. */
export async function getAllNotifications(): Promise<ReminderNotification[]> {
  const res = await api.get<ReminderNotification[]>("/reminders/notifications/all");
  return res.data;
}
