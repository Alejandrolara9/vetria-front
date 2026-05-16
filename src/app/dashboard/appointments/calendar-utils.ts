import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { dateFnsLocalizer } from "react-big-calendar";
import type { Appointment } from "@/services/appointments";

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { es },
});

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

export function toCalendarEvent(appointment: Appointment): CalendarEvent {
  const [year, month, day] = appointment.date.slice(0, 10).split("-").map(Number);
  const [sh, sm] = appointment.startTime.split(":").map(Number);
  const [eh, em] = appointment.endTime.split(":").map(Number);
  return {
    id: appointment.id,
    title: appointment.title,
    start: new Date(year, month - 1, day, sh, sm),
    end: new Date(year, month - 1, day, eh, em),
    resource: appointment,
  };
}

export function dateToApiFields(
  start: Date,
  end: Date
): { date: string; startTime: string; endTime: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
  };
}

export function calcDuration(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const total = (eh * 60 + em) - (sh * 60 + sm);
  if (total <= 0) return "";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} minuto${m !== 1 ? "s" : ""}`;
  if (m === 0) return `${h} hora${h !== 1 ? "s" : ""}`;
  return `${h} hora${h !== 1 ? "s" : ""} ${m} minuto${m !== 1 ? "s" : ""}`;
}

export function isEndTimeValid(startTime: string, endTime: string): boolean {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return (eh * 60 + em) > (sh * 60 + sm);
}

export function getVisibleVetId(
  role: string,
  currentUserId: string,
  selectedVetId: string
): string | undefined {
  if (role === "VET") return currentUserId;
  if (!selectedVetId || selectedVetId === "all") return undefined;
  return selectedVetId;
}
