"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/services/api";
import {
  listAppointments,
  getAppointmentStatsToday,
  createAppointment,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
  deleteAppointment,
  type Appointment,
  type AppointmentStats,
  type AppointmentType,
} from "@/services/appointments";
import { calcDuration, isEndTimeValid } from "./calendar-utils";

// ─── Utilidades de color por tipo ────────────────────────────────────────────

const TYPE_LABELS: Record<AppointmentType, string> = {
  CONSULTATION: "Consulta",
  VACCINATION: "Vacunacion",
  SURGERY: "Cirugia",
  GROOMING: "Estetica",
  CHECKUP: "Revision",
  EMERGENCY: "Emergencia",
  OTHER: "Otro",
};

const TYPE_COLORS: Record<AppointmentType, { bg: string; text: string; border: string }> = {
  CONSULTATION: { bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-300" },
  VACCINATION:  { bg: "bg-green-100",  text: "text-green-800",  border: "border-green-300" },
  SURGERY:      { bg: "bg-red-100",    text: "text-red-800",    border: "border-red-300" },
  GROOMING:     { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  CHECKUP:      { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  EMERGENCY:    { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  OTHER:        { bg: "bg-gray-100",   text: "text-gray-700",   border: "border-gray-300" },
};

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED:  "Programada",
  CONFIRMED:  "Confirmada",
  CANCELLED:  "Cancelada",
  COMPLETED:  "Completada",
  NO_SHOW:    "No asistio",
};

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED:  "bg-yellow-100 text-yellow-800",
  CONFIRMED:  "bg-blue-100 text-blue-800",
  CANCELLED:  "bg-red-100 text-red-800",
  COMPLETED:  "bg-green-100 text-green-800",
  NO_SHOW:    "bg-gray-100 text-gray-700",
};

// Motivos predefinidos por tipo de cita
const REASON_OPTIONS: Record<AppointmentType, string[]> = {
  VACCINATION: [
    "Antirrábica", "Parvovirus", "Moquillo", "Hepatitis infecciosa canina",
    "Leptospirosis", "Bordetella", "Parainfluenza", "Triple felina (HVR-FCV-PVF)",
    "Leucemia felina (FeLV)", "Rabia felina", "Cuádruple felina", "Otra vacuna",
  ],
  CONSULTATION: [
    "Consulta general", "Revisión de rutina", "Problemas digestivos",
    "Problemas respiratorios", "Problemas dermatológicos", "Problemas oculares",
    "Problemas urinarios", "Pérdida de peso", "Falta de apetito",
    "Dolor o cojera", "Vómito / Diarrea", "Otro",
  ],
  CHECKUP: [
    "Revisión anual", "Control post-cirugía", "Control de tratamiento",
    "Examen preventivo", "Control de peso", "Análisis de laboratorio", "Otro",
  ],
  SURGERY: [
    "Castración", "Esterilización", "Extracción dental", "Extirpación de masa/tumor",
    "Herida / Trauma", "Cirugía abdominal", "Cirugía ortopédica", "Otra cirugía",
  ],
  GROOMING: [
    "Baño y secado", "Corte de pelo estándar", "Corte de pelo de raza",
    "Limpieza de oídos", "Corte de uñas", "Baño medicado", "Deslanado", "Otro",
  ],
  EMERGENCY: [
    "Trauma / Accidente", "Intoxicación", "Dificultad respiratoria",
    "Convulsiones", "Sangrado", "Pérdida de conciencia", "Otra emergencia",
  ],
  OTHER: ["Otro procedimiento"],
};

const APPOINTMENT_TO_EVENT_TYPE: Record<AppointmentType, string> = {
  VACCINATION:  "VACCINE",
  CONSULTATION: "CHECKUP",
  CHECKUP:      "CHECKUP",
  SURGERY:      "OTHER",
  GROOMING:     "OTHER",
  EMERGENCY:    "OTHER",
  OTHER:        "OTHER",
};

// Días sugeridos de próxima dosis por vacuna
export const VACCINE_NEXT_DAYS: Record<string, number> = {
  "Antirrábica": 365,
  "Parvovirus": 365,
  "Moquillo": 365,
  "Hepatitis infecciosa canina": 365,
  "Leptospirosis": 365,
  "Bordetella": 180,
  "Parainfluenza": 365,
  "Triple felina (HVR-FCV-PVF)": 365,
  "Leucemia felina (FeLV)": 365,
  "Rabia felina": 365,
  "Cuádruple felina": 365,
};

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=dom, 1=lun, …
  // Semana empieza en lunes
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" });
}

// ─── Componentes internos ─────────────────────────────────────────────────────

interface Pet {
  id: string;
  name: string;
  species: string;
  client: { id: string; name: string };
}

interface Vet {
  id: string;
  name: string;
  role: string;
}

// Modal de creacion de cita
interface CreateModalProps {
  pets: Pet[];
  vets: Vet[];
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialVetId?: string;
  onClose: () => void;
  onCreated: () => void;
}

function CreateAppointmentModal({
  pets,
  vets,
  initialDate,
  initialStartTime,
  initialEndTime,
  initialVetId,
  onClose,
  onCreated,
}: CreateModalProps) {
  const [form, setForm] = useState<{
    petId: string;
    vetId: string;
    date: string;
    startTime: string;
    endTime: string;
    type: AppointmentType;
    reason: string;
    notes: string;
  }>({
    petId: "",
    vetId: initialVetId ?? "",
    date: initialDate ?? toDateStr(new Date()),
    startTime: initialStartTime ?? "09:00",
    endTime: initialEndTime ?? "10:00",
    type: "CONSULTATION",
    reason: "",
    notes: "",
  });
  const [petSearch, setPetSearch] = useState("");
  const [showPetResults, setShowPetResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");

  const reasonOptions = REASON_OPTIONS[form.type] ?? ["Otro"];
  const isCustomReason = form.reason === "Otro" || form.reason === "Otra vacuna" || form.reason === "Otra cirugía" || form.reason === "Otra emergencia" || form.reason === "Otro procedimiento";
  const appointmentDuration = calcDuration(form.startTime, form.endTime);

  const filteredPets = petSearch.trim()
    ? pets.filter(
        (p) =>
          p.name.toLowerCase().includes(petSearch.toLowerCase()) ||
          (p.client?.name ?? "").toLowerCase().includes(petSearch.toLowerCase()) ||
          (p.species ?? "").toLowerCase().includes(petSearch.toLowerCase())
      )
    : pets;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.petId || !form.vetId) {
      setError("Debes seleccionar mascota y veterinario.");
      return;
    }
    if (!isEndTimeValid(form.startTime, form.endTime)) {
      setError("La hora de fin debe ser posterior a la de inicio.");
      return;
    }
    const selectedPet = pets.find((p) => p.id === form.petId);
    if (!selectedPet) { setError("Mascota no válida."); return; }

    const finalReason = isCustomReason ? customReason : form.reason;
    const payload = {
      petId: form.petId,
      clientId: selectedPet.client.id,
      vetId: form.vetId,
      title: TYPE_LABELS[form.type] + (finalReason ? ` — ${finalReason}` : ""),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      notes: form.notes || undefined,
    };
    setSaving(true);
    setError(null);
    try {
      await createAppointment(payload);
      onCreated();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Error al guardar la cita.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Nueva Cita</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>
          )}

          {/* Buscar mascota */}
          <div>
            <label className="block text-sm font-medium mb-1">Mascota</label>
            {form.petId ? (
              <div className="flex items-center justify-between px-3 py-2 border border-primary rounded-lg bg-primary/5 text-sm">
                <span className="font-medium">
                  {pets.find(p => p.id === form.petId)?.name} — {pets.find(p => p.id === form.petId)?.client.name}
                </span>
                <button
                  type="button"
                  onClick={() => { setForm({ ...form, petId: "" }); setPetSearch(""); }}
                  className="text-muted-foreground hover:text-red-500 ml-2 text-xs"
                >
                  ✕ cambiar
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Escribe nombre de mascota o tutor..."
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  value={petSearch}
                  onChange={(e) => { setPetSearch(e.target.value); setShowPetResults(true); }}
                  onFocus={() => setShowPetResults(true)}
                  autoComplete="off"
                />
                {showPetResults && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredPets.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</p>
                    ) : (
                      filteredPets.slice(0, 8).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-border last:border-0"
                          onClick={() => {
                            setForm({ ...form, petId: p.id });
                            setPetSearch("");
                            setShowPetResults(false);
                          }}
                        >
                          <span className="font-medium">{p.name}</span>
                          <span className="text-muted-foreground ml-1">({p.species})</span>
                          <span className="text-muted-foreground ml-1">— {p.client.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Veterinario */}
          <div>
            <label className="block text-sm font-medium mb-1">Veterinario</label>
            <select
              required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              value={form.vetId}
              onChange={(e) => setForm({ ...form, vetId: e.target.value })}
            >
              <option value="">Seleccionar veterinario</option>
              {vets.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Fecha y hora */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Hora inicio</label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora fin</label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>
          {appointmentDuration && (
            <p className="text-xs text-green-600 font-medium -mt-1">
              ✓ Duración: {appointmentDuration}
            </p>
          )}

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              value={form.type}
              onChange={(e) => {
                const t = e.target.value as AppointmentType;
                setForm({ ...form, type: t, reason: REASON_OPTIONS[t][0] });
                setCustomReason("");
              }}
            >
              {(Object.keys(TYPE_LABELS) as AppointmentType[]).map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium mb-1">Motivo de consulta</label>
            <select
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              value={form.reason}
              onChange={(e) => { setForm({ ...form, reason: e.target.value }); setCustomReason(""); }}
            >
              <option value="">Seleccionar motivo...</option>
              {reasonOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {isCustomReason && (
              <input
                type="text"
                placeholder="Describe el motivo..."
                className="w-full mt-2 px-3 py-2 border border-border rounded-lg text-sm"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}
          </div>

          {/* Notas adicionales */}
          <div>
            <label className="block text-sm font-medium mb-1">Notas adicionales</label>
            <textarea
              rows={2}
              placeholder="Informacion relevante para el veterinario..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Crear Cita"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal de detalle de cita
interface DetailModalProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdated: () => void;
}

function inferAppointmentType(title: string): AppointmentType {
  const t = title.toLowerCase();
  if (t.includes("vacun")) return "VACCINATION";
  if (t.includes("cirug")) return "SURGERY";
  if (t.includes("estetica") || t.includes("baño") || t.includes("corte")) return "GROOMING";
  if (t.includes("emergencia")) return "EMERGENCY";
  if (t.includes("revision") || t.includes("control")) return "CHECKUP";
  if (t.includes("consulta")) return "CONSULTATION";
  return "OTHER";
}

function AppointmentDetailModal({ appointment, onClose, onUpdated }: DetailModalProps) {
  const [acting, setActing] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showAttendForm, setShowAttendForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inferredType = inferAppointmentType(appointment.title);
  const [attendForm, setAttendForm] = useState({
    eventType: APPOINTMENT_TO_EVENT_TYPE[inferredType],
    title: appointment.title.replace(/^[^—]+— ?/, ""),
    description: "",
    appliedDate: new Date().toISOString().slice(0, 10),
    nextDueDate: "",
    createEvent: true,
  });

  const colors = { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" };
  const isReadOnly =
    appointment.status === "COMPLETED" ||
    appointment.status === "CANCELLED" ||
    appointment.status === "NO_SHOW";

  async function handleConfirm() {
    setActing(true);
    setError(null);
    try {
      await confirmAppointment(appointment.id);
      onUpdated();
      onClose();
    } catch {
      setError("No se pudo confirmar la cita.");
    } finally {
      setActing(false);
    }
  }

  async function handleAttend(e: React.FormEvent) {
    e.preventDefault();
    setActing(true);
    setError(null);
    try {
      let clinicalEventId: string | undefined;

      if (attendForm.createEvent) {
        const eventRes = await api.post(`/pets/${appointment.pet.id}/events`, {
          type: attendForm.eventType,
          title: attendForm.title || appointment.title,
          description: attendForm.description || undefined,
          appliedDate: attendForm.appliedDate,
          nextDueDate: attendForm.nextDueDate || undefined,
        });
        clinicalEventId = eventRes.data.id;

        // Auto-crear SmartReminder si hay fecha de próxima atención
        if (attendForm.nextDueDate) {
          await api.post("/reminders", {
            petId: appointment.pet.id,
            eventType: attendForm.eventType,
            calculatedDueDate: new Date(attendForm.nextDueDate).toISOString(),
            clinicalEventId,
          });
        }
      }

      await completeAppointment(appointment.id);
      onUpdated();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Error al registrar la atención.");
    } finally {
      setActing(false);
    }
  }

  async function handleCancel() {
    if (!cancelReason.trim()) {
      setError("Debes indicar el motivo de cancelacion.");
      return;
    }
    setActing(true);
    setError(null);
    try {
      await cancelAppointment(appointment.id, cancelReason);
      onUpdated();
      onClose();
    } catch {
      setError("No se pudo cancelar la cita.");
    } finally {
      setActing(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Eliminar esta cita permanentemente?")) return;
    setActing(true);
    try {
      await deleteAppointment(appointment.id);
      onUpdated();
      onClose();
    } catch {
      setError("No se pudo eliminar la cita.");
    } finally {
      setActing(false);
    }
  }

  const scheduledDate = new Date(appointment.date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header con color del tipo */}
        <div className={`px-6 py-4 ${colors.bg} border-b ${colors.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                {appointment.title}
              </span>
              <h2 className="text-lg font-semibold mt-1">{appointment.pet.name}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>
          )}

          {/* Estado */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[appointment.status]}`}>
              {STATUS_LABELS[appointment.status]}
            </span>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Fecha y hora</p>
              <p className="font-medium">
                {scheduledDate.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-muted-foreground">{appointment.startTime} — {appointment.endTime}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Veterinario</p>
              <p className="font-medium">{appointment.vet.name}</p>
            </div>
          </div>

          <div className="text-sm">
            <p className="text-muted-foreground text-xs">Especie</p>
            <p className="font-medium">{appointment.pet.species}</p>
          </div>

          {appointment.notes && (
            <div className="text-sm">
              <p className="text-muted-foreground text-xs">Notas</p>
              <p className="text-muted-foreground">{appointment.notes}</p>
            </div>
          )}

          {/* Formulario de cancelacion */}
          {showCancelForm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              <label className="text-sm font-medium text-red-800">Motivo de cancelacion</label>
              <input
                type="text"
                placeholder="Ej: Cliente no puede asistir..."
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={acting}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {acting ? "Cancelando..." : "Confirmar cancelacion"}
                </button>
                <button
                  onClick={() => setShowCancelForm(false)}
                  className="px-3 py-1.5 border border-border text-sm rounded-lg hover:bg-gray-50"
                >
                  Volver
                </button>
              </div>
            </div>
          )}

          {/* Formulario de registro de atención */}
          {showAttendForm && (
            <form onSubmit={handleAttend} className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-green-800">Registrar atención para {appointment.pet.name}</p>

              <label className="flex items-center gap-2 text-sm text-green-800">
                <input
                  type="checkbox"
                  checked={attendForm.createEvent}
                  onChange={(e) => setAttendForm({ ...attendForm, createEvent: e.target.checked })}
                  className="rounded"
                />
                Registrar en historial clínico
              </label>

              {attendForm.createEvent && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-green-800 mb-1">Tipo de evento</label>
                      <select
                        className="w-full px-3 py-1.5 border border-green-300 rounded-lg text-sm bg-white"
                        value={attendForm.eventType}
                        onChange={(e) => setAttendForm({ ...attendForm, eventType: e.target.value })}
                      >
                        <option value="VACCINE">Vacuna</option>
                        <option value="DEWORMING">Desparasitación</option>
                        <option value="ANTIPARASITIC">Antiparasitario</option>
                        <option value="CHECKUP">Revisión</option>
                        <option value="OTHER">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-green-800 mb-1">Fecha aplicación</label>
                      <input
                        type="date"
                        className="w-full px-3 py-1.5 border border-green-300 rounded-lg text-sm bg-white"
                        value={attendForm.appliedDate}
                        onChange={(e) => setAttendForm({ ...attendForm, appliedDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">Procedimiento realizado</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 border border-green-300 rounded-lg text-sm bg-white"
                      value={attendForm.title}
                      onChange={(e) => setAttendForm({ ...attendForm, title: e.target.value })}
                      placeholder="Ej: Antirrábica, Consulta general..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">
                      Próxima cita / vencimiento (fecha opcional)
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-1.5 border border-green-300 rounded-lg text-sm bg-white"
                      value={attendForm.nextDueDate}
                      onChange={(e) => setAttendForm({ ...attendForm, nextDueDate: e.target.value })}
                    />
                    {attendForm.eventType === "VACCINE" && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {[30, 90, 180, 365].map((d) => (
                          <button
                            key={d}
                            type="button"
                            className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            onClick={() => {
                              const next = new Date();
                              next.setDate(next.getDate() + d);
                              setAttendForm({ ...attendForm, nextDueDate: next.toISOString().slice(0, 10) });
                            }}
                          >
                            +{d === 365 ? "1 año" : `${d}d`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">Observaciones (opcional)</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-1.5 border border-green-300 rounded-lg text-sm bg-white resize-none"
                      value={attendForm.description}
                      onChange={(e) => setAttendForm({ ...attendForm, description: e.target.value })}
                      placeholder="Dosis, lote, reacciones, indicaciones..."
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={acting}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {acting ? "Guardando..." : "Registrar y completar cita"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAttendForm(false)}
                  className="px-3 py-2 border border-border text-sm rounded-lg hover:bg-gray-50"
                >
                  Volver
                </button>
              </div>
            </form>
          )}

          {/* Acciones por estado */}
          {!isReadOnly && !showCancelForm && !showAttendForm && (
            <div className="flex gap-2 pt-2 flex-wrap">
              {appointment.status === "SCHEDULED" && (
                <button
                  onClick={handleConfirm}
                  disabled={acting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Confirmar
                </button>
              )}
              {(appointment.status === "CONFIRMED" || appointment.status === "SCHEDULED") && (
                <button
                  onClick={() => setShowAttendForm(true)}
                  disabled={acting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Registrar atención
                </button>
              )}
              <button
                onClick={() => setShowCancelForm(true)}
                disabled={acting}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
              >
                Cancelar cita
              </button>
            </div>
          )}

          {/* Eliminar (siempre disponible) */}
          <div className="pt-1 border-t border-border">
            <button
              onClick={handleDelete}
              disabled={acting}
              className="text-xs text-muted-foreground hover:text-danger disabled:opacity-50"
            >
              Eliminar cita permanentemente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente de bloque de cita en el calendario ───────────────────────────

interface AppointmentBlockProps {
  appointment: Appointment;
  onClick: (a: Appointment) => void;
}

function AppointmentBlock({ appointment, onClick }: AppointmentBlockProps) {
  const isCancelled = appointment.status === "CANCELLED";

  return (
    <button
      onClick={() => onClick(appointment)}
      className={`w-full text-left px-2 py-1 rounded-md border text-xs mb-1 transition-opacity hover:opacity-80 bg-blue-100 text-blue-800 border-blue-300 ${isCancelled ? "opacity-40 line-through" : ""}`}
    >
      <span className="font-medium block truncate">{appointment.startTime} {appointment.pet.name}</span>
      <span className="block truncate opacity-75">{appointment.title}</span>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const searchParams = useSearchParams();

  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [pets, setPets] = useState<Pet[]>([]);
  const [vets, setVets] = useState<Vet[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Abrir modal de creacion si viene ?action=new desde el dashboard
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setShowCreate(true);
    }
  }, [searchParams]);

  // Cargar mascotas y veterinarios una sola vez
  useEffect(() => {
    async function loadSelectors() {
      try {
        const [petsRes, usersRes] = await Promise.all([
          api.get("/pets"),
          api.get("/users").catch(() => ({ data: [] })),
        ]);
        setPets(petsRes.data);
        const allUsers: Vet[] = usersRes.data;
        const vetsOnly = allUsers.filter((u) => u.role === "VET");
        setVets(vetsOnly.length > 0 ? vetsOnly : allUsers);
      } catch {
        // Continuar sin selectores; el usuario verá listas vacias
      }
    }
    loadSelectors();
  }, []);

  const loadCalendar = useCallback(async () => {
    setLoadingCalendar(true);
    try {
      // El backend acepta ?date para filtrar; cargamos todo el rango haciendo una query sin filtro
      // y filtramos en el cliente por la semana visible
      const data = await listAppointments();
      setAppointments(data);
    } catch {
      setAppointments([]);
    } finally {
      setLoadingCalendar(false);
    }
  }, [weekStart]);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await getAppointmentStatsToday();
      setStats(data);
    } catch {
      setStats({ total: 0, confirmed: 0, completed: 0, pending: 0 });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Construir los 7 dias de la semana actual
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = addDays(weekStart, 6);

  // Agrupar citas por dia (string YYYY-MM-DD)
  const appointmentsByDay: Record<string, Appointment[]> = {};
  for (const appt of appointments) {
    const dayKey = toDateStr(new Date(appt.date));
    if (!appointmentsByDay[dayKey]) appointmentsByDay[dayKey] = [];
    appointmentsByDay[dayKey].push(appt);
  }
  for (const key of Object.keys(appointmentsByDay)) {
    appointmentsByDay[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  const weekDayKeys = new Set(weekDays.map(toDateStr));
  const weekAppointments = appointments.filter((a) => weekDayKeys.has(toDateStr(new Date(a.date))));

  const todayStr = toDateStr(new Date());

  function prevWeek() {
    setWeekStart((d) => addDays(d, -7));
  }

  function nextWeek() {
    setWeekStart((d) => addDays(d, 7));
  }

  function goToToday() {
    setWeekStart(startOfWeek(new Date()));
  }

  const weekLabel = `${weekStart.toLocaleDateString("es-CO", { day: "numeric", month: "short" })} — ${weekEnd.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground text-sm mt-0.5 hidden sm:block">Gestión de citas veterinarias</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-2 md:px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          + Nueva Cita
        </button>
      </div>

      {/* Stats del dia */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card-bg rounded-xl border border-border p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-10"></div>
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard label="Citas hoy" value={stats.total} color="bg-blue-500" />
            <StatCard label="Confirmadas" value={stats.confirmed} color="bg-green-500" />
            <StatCard label="Pendientes" value={stats.pending} color="bg-yellow-500" />
            <StatCard label="Completadas" value={stats.completed} color="bg-purple-500" />
          </>
        ) : null}
      </div>

      {/* Leyenda de tipos */}
      <div className="hidden sm:flex flex-wrap gap-2 mb-4">
        {(Object.keys(TYPE_LABELS) as AppointmentType[]).map((t) => (
          <span
            key={t}
            className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[t].bg} ${TYPE_COLORS[t].text} ${TYPE_COLORS[t].border}`}
          >
            {TYPE_LABELS[t]}
          </span>
        ))}
      </div>

      {/* Navegacion de semana */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="p-2 border border-border rounded-lg hover:bg-gray-50 text-sm"
            aria-label="Semana anterior"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-gray-50"
          >
            Hoy
          </button>
          <button
            onClick={nextWeek}
            className="p-2 border border-border rounded-lg hover:bg-gray-50 text-sm"
            aria-label="Semana siguiente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <span className="text-sm font-medium text-muted-foreground">{weekLabel}</span>
        {loadingCalendar && (
          <span className="text-xs text-muted-foreground animate-pulse">Cargando...</span>
        )}
      </div>

      {/* Calendario semanal — horizontally scrollable on mobile */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <div className="min-w-[640px] bg-card-bg">
          {/* Header de dias */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((day) => {
              const dayStr = toDateStr(day);
              const isToday = dayStr === todayStr;
              const count = (appointmentsByDay[dayStr] ?? []).length;
              return (
                <div
                  key={dayStr}
                  className={`p-2 text-center border-r last:border-r-0 border-border ${isToday ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <p className={`text-xs uppercase font-medium leading-tight ${isToday ? "text-blue-700" : "text-muted-foreground"}`}>
                    {formatDateLong(day)}
                  </p>
                  {count > 0 && (
                    <span className="inline-block mt-1 text-xs bg-primary text-white rounded-full w-5 h-5 leading-5 text-center">
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cuerpo del calendario */}
          <div className="grid grid-cols-7 min-h-48">
            {weekDays.map((day) => {
              const dayStr = toDateStr(day);
              const isToday = dayStr === todayStr;
              const dayAppts = appointmentsByDay[dayStr] ?? [];

              return (
                <div
                  key={dayStr}
                  className={`p-1.5 border-r last:border-r-0 border-border min-h-32 ${isToday ? "bg-blue-50/30" : ""}`}
                >
                  {dayAppts.length === 0 ? (
                    <p className="text-xs text-muted-foreground/50 text-center mt-4">—</p>
                  ) : (
                    dayAppts.map((appt) => (
                      <AppointmentBlock
                        key={appt.id}
                        appointment={appt}
                        onClick={setSelectedAppointment}
                      />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resumen de citas de la semana */}
      {weekAppointments.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-semibold mb-3">
            Citas esta semana ({weekAppointments.length})
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm min-w-[560px] bg-card-bg">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mascota</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Veterinario</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha y hora</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {weekAppointments.map((appt) => (
                  <tr
                    key={appt.id}
                    onClick={() => setSelectedAppointment(appt)}
                    className="border-b border-border last:border-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium">{appt.pet.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{appt.vet.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(appt.date).toLocaleDateString("es-CO", {
                        weekday: "short", day: "numeric", month: "short",
                      })}{" "}
                      {appt.startTime}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-300">
                        {appt.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[appt.status]}`}>
                        {STATUS_LABELS[appt.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      {showCreate && (
        <CreateAppointmentModal
          pets={pets}
          vets={vets}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            loadCalendar();
            loadStats();
          }}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdated={() => {
            loadCalendar();
            loadStats();
          }}
        />
      )}
    </div>
  );
}

// ─── StatCard auxiliar ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 flex items-center gap-3">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-sm font-bold">{value}</span>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
