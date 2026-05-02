"use client";

import { useEffect, useState } from "react";
import {
  listProtocols,
  createProtocol,
  updateProtocol,
  deleteProtocol,
  type VaccinationProtocol,
  type CreateProtocolDto,
} from "@/services/protocols";
import { listReminders, type Reminder } from "@/services/reminders";

// ─── Constantes ───────────────────────────────────────────────────────────────

const SPECIES_OPTIONS = ["Canino", "Felino", "Ave", "Reptil", "Otro"] as const;

/** Protocolos predefinidos comunes para prellenar el formulario rápidamente */
const QUICK_TEMPLATES: Array<{
  label: string;
  description: string;
  preset: Partial<ProtocolFormData>;
}> = [
  {
    label: "Antirrábica anual",
    description: "Canino · 365 días",
    preset: {
      name: "Antirrábica",
      vaccineType: "Antirrábica",
      species: "Canino",
      intervalDays: "365",
      preReminderDays: "7",
      postReminderDays: "3",
    },
  },
  {
    label: "Vacuna múltiple 3 meses",
    description: "Cualquier especie · 90 días",
    preset: {
      name: "Vacuna múltiple",
      vaccineType: "Multivalente",
      intervalDays: "90",
      preReminderDays: "7",
      postReminderDays: "3",
    },
  },
  {
    label: "Desparasitación mensual",
    description: "Cualquier especie · 30 días",
    preset: {
      name: "Desparasitación",
      vaccineType: "Desparasitante",
      intervalDays: "30",
      preReminderDays: "3",
      postReminderDays: "2",
    },
  },
  {
    label: "Antirrábica felina",
    description: "Felino · 365 días",
    preset: {
      name: "Antirrábica felina",
      vaccineType: "Antirrábica",
      species: "Felino",
      intervalDays: "365",
      preReminderDays: "7",
      postReminderDays: "3",
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDays(days: number | null | undefined): string {
  if (!days) return "—";
  if (days === 365) return "1 año";
  if (days === 180) return "6 meses";
  if (days === 90) return "3 meses";
  if (days === 30) return "1 mes";
  return `${days} días`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ─── Diagrama de flujo de notificaciones ─────────────────────────────────────

function NotificationFlowDiagram({ preReminderDays = 7, postReminderDays = 3 }: {
  preReminderDays?: number;
  postReminderDays?: number;
}) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
        Flujo de notificaciones
      </p>
      <div className="flex items-center gap-1 flex-wrap text-sm">
        <div className="flex items-center gap-1 bg-white border border-blue-200 rounded-lg px-3 py-2">
          <span className="text-base">📅</span>
          <span className="font-medium text-blue-900">Fecha de vacuna</span>
        </div>

        <div className="flex items-center gap-1 text-blue-600 font-mono text-xs">
          <span className="hidden sm:inline">────</span>
          <span className="bg-blue-100 rounded px-2 py-0.5 whitespace-nowrap">
            {preReminderDays}d antes
          </span>
          <span className="hidden sm:inline">──▶</span>
        </div>

        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <span className="text-base">✉️</span>
          <span className="font-medium text-amber-800">Recordatorio PRE</span>
        </div>

        <div className="flex items-center gap-1 text-blue-600 font-mono text-xs">
          <span className="hidden sm:inline">────▶</span>
        </div>

        <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <span className="text-base">✅</span>
          <span className="font-medium text-green-800">Fecha vencimiento</span>
        </div>

        <div className="flex items-center gap-1 text-blue-600 font-mono text-xs">
          <span className="hidden sm:inline">────</span>
          <span className="bg-blue-100 rounded px-2 py-0.5 whitespace-nowrap">
            {postReminderDays}d después
          </span>
          <span className="hidden sm:inline">──▶</span>
        </div>

        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          <span className="text-base">🔔</span>
          <span className="font-medium text-rose-800">Seguimiento POST</span>
        </div>
      </div>
      <p className="text-xs text-blue-600 mt-3">
        El sistema calcula estas fechas automaticamente al registrar un recordatorio de vacuna.
      </p>
    </div>
  );
}

// ─── Estado del formulario ────────────────────────────────────────────────────

interface ProtocolFormData {
  name: string;
  vaccineType: string;
  species: string;
  breed: string;
  minAgeDays: string;
  maxAgeDays: string;
  minWeightKg: string;
  intervalDays: string;
  preReminderDays: string;
  postReminderDays: string;
  customMessage: string;
  active: boolean;
}

const DEFAULT_FORM: ProtocolFormData = {
  name: "",
  vaccineType: "",
  species: "Canino",
  breed: "",
  minAgeDays: "",
  maxAgeDays: "",
  minWeightKg: "",
  intervalDays: "365",
  preReminderDays: "7",
  postReminderDays: "3",
  customMessage: "",
  active: true,
};

function protocolToForm(p: VaccinationProtocol): ProtocolFormData {
  return {
    name: p.name,
    vaccineType: p.vaccineType,
    species: p.species,
    breed: p.breed ?? "",
    minAgeDays: p.minAgeDays != null ? String(p.minAgeDays) : "",
    maxAgeDays: p.maxAgeDays != null ? String(p.maxAgeDays) : "",
    minWeightKg: p.minWeightKg != null ? String(p.minWeightKg) : "",
    intervalDays: p.intervalDays != null ? String(p.intervalDays) : "",
    preReminderDays: String(p.preReminderDays),
    postReminderDays: String(p.postReminderDays),
    customMessage: p.customMessage ?? "",
    active: p.active,
  };
}

// ─── Modal crear / editar protocolo ──────────────────────────────────────────

function ProtocolModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: VaccinationProtocol;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(initial);
  const [form, setForm] = useState<ProtocolFormData>(
    initial ? protocolToForm(initial) : DEFAULT_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Chips de sugerencia rápida — solo en modo creación
  function applyTemplate(preset: Partial<ProtocolFormData>) {
    setForm((_prev) => ({ ...DEFAULT_FORM, ...preset, active: true }));
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  }

  // Convierte el string del formulario a número opcional para el DTO
  function toOptionalInt(val: string): number | undefined {
    const n = parseInt(val, 10);
    return isNaN(n) || n <= 0 ? undefined : n;
  }

  function toOptionalFloat(val: string): number | undefined {
    const n = parseFloat(val);
    return isNaN(n) || n <= 0 ? undefined : n;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const preReminderDays = parseInt(form.preReminderDays, 10);
    const postReminderDays = parseInt(form.postReminderDays, 10);

    if (isNaN(preReminderDays) || preReminderDays < 1) {
      setError("El aviso previo debe ser al menos 1 día");
      return;
    }
    if (isNaN(postReminderDays) || postReminderDays < 1) {
      setError("El seguimiento debe ser al menos 1 día");
      return;
    }

    const payload: CreateProtocolDto = {
      name: form.name.trim(),
      vaccineType: form.vaccineType.trim(),
      species: form.species,
      breed: form.breed.trim() || undefined,
      minAgeDays: toOptionalInt(form.minAgeDays),
      maxAgeDays: toOptionalInt(form.maxAgeDays),
      minWeightKg: toOptionalFloat(form.minWeightKg),
      intervalDays: toOptionalInt(form.intervalDays),
      preReminderDays,
      postReminderDays,
      customMessage: form.customMessage.trim() || undefined,
    };

    try {
      setSaving(true);
      if (initial) {
        await updateProtocol(initial.id, { ...payload, active: form.active });
      } else {
        await createProtocol(payload);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Error al guardar el protocolo");
    } finally {
      setSaving(false);
    }
  }

  const INTERVAL_QUICK = [
    { label: "30d", value: "30" },
    { label: "90d", value: "90" },
    { label: "180d", value: "180" },
    { label: "365d", value: "365" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Editar Protocolo" : "Nuevo Protocolo de Vacunacion"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Chips de plantillas rápidas — solo en modo creación */}
        {!isEditing && (
          <div className="px-6 pt-4">
            <p className="text-xs text-muted-foreground font-medium mb-2">
              Comenzar desde una plantilla:
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => applyTemplate(tpl.preset)}
                  className="flex flex-col items-start px-3 py-2 border border-border rounded-lg text-left hover:border-primary hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-foreground">{tpl.label}</span>
                  <span className="text-xs text-muted-foreground">{tpl.description}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-border my-4" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre del protocolo <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="Ej: Antirrábica caninos adultos"
              className="w-full px-4 py-2 border border-border rounded-lg text-sm"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Tipo de vacuna */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de vacuna / tratamiento <span className="text-red-500">*</span>
            </label>
            <input
              name="vaccineType"
              type="text"
              required
              placeholder="Ej: Antirrábica, Multivalente, Desparasitante..."
              className="w-full px-4 py-2 border border-border rounded-lg text-sm"
              value={form.vaccineType}
              onChange={handleChange}
            />
          </div>

          {/* Especie y raza */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Especie <span className="text-red-500">*</span>
              </label>
              <select
                name="species"
                required
                className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-white"
                value={form.species}
                onChange={handleChange}
              >
                {SPECIES_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Raza <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <input
                name="breed"
                type="text"
                placeholder="Todas las razas"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.breed}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Rango de edad en días */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Rango de edad en dias <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  name="minAgeDays"
                  type="number"
                  min="0"
                  placeholder="Minimo"
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  value={form.minAgeDays}
                  onChange={handleChange}
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">dias</span>
              </div>
              <div className="relative">
                <input
                  name="maxAgeDays"
                  type="number"
                  min="0"
                  placeholder="Maximo"
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                  value={form.maxAgeDays}
                  onChange={handleChange}
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">dias</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Deja en blanco para aplicar a cualquier edad. Ejemplo: 60 – 180 dias para cachorros.
            </p>
          </div>

          {/* Peso mínimo */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Peso minimo en kg <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <div className="relative max-w-[200px]">
              <input
                name="minWeightKg"
                type="number"
                min="0"
                step="0.1"
                placeholder="Sin limite"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.minWeightKg}
                onChange={handleChange}
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">kg</span>
            </div>
          </div>

          {/* Recurrencia */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Recurrencia (cada cuantos dias)
            </label>
            <div className="flex gap-2 mb-2">
              {INTERVAL_QUICK.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, intervalDays: q.value }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.intervalDays === q.value
                      ? "bg-primary text-white border-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <div className="relative max-w-[200px]">
              <input
                name="intervalDays"
                type="number"
                min="1"
                placeholder="Vacuna unica"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.intervalDays}
                onChange={handleChange}
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">dias</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Deja en blanco si la vacuna se aplica una sola vez.
            </p>
          </div>

          {/* Aviso previo */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              Aviso previo al vencimiento <span className="text-red-500">*</span>
              <span
                title="El sistema enviara el recordatorio este numero de dias antes del vencimiento de la vacuna"
                className="ml-1 text-muted-foreground cursor-help text-xs border border-border rounded-full w-4 h-4 inline-flex items-center justify-center"
              >
                ?
              </span>
            </label>
            <div className="relative max-w-[200px]">
              <input
                name="preReminderDays"
                type="number"
                required
                min="1"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.preReminderDays}
                onChange={handleChange}
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">dias antes</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Se envia el recordatorio PRE {form.preReminderDays || "?"} dias antes del vencimiento.
            </p>
          </div>

          {/* Seguimiento post */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              Seguimiento post vencimiento <span className="text-red-500">*</span>
              <span
                title="Si el tutor no confirma la cita, el sistema enviara un seguimiento este numero de dias despues del vencimiento"
                className="ml-1 text-muted-foreground cursor-help text-xs border border-border rounded-full w-4 h-4 inline-flex items-center justify-center"
              >
                ?
              </span>
            </label>
            <div className="relative max-w-[200px]">
              <input
                name="postReminderDays"
                type="number"
                required
                min="1"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.postReminderDays}
                onChange={handleChange}
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">dias despues</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Se envia el seguimiento POST {form.postReminderDays || "?"} dias despues si no hay confirmacion.
            </p>
          </div>

          {/* Mensaje personalizado */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mensaje personalizado <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <textarea
              name="customMessage"
              rows={2}
              placeholder="Ej: Recuerda traer el carnet de vacunacion de tu mascota..."
              className="w-full px-4 py-2 border border-border rounded-lg text-sm resize-none"
              value={form.customMessage}
              onChange={handleChange}
            />
          </div>

          {/* Toggle activo — solo en edicion */}
          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleChange}
                className="rounded border-border"
              />
              <label htmlFor="active" className="text-sm font-medium">
                Protocolo activo
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear Protocolo"}
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

// ─── Estado vacío — cuando no hay protocolos ──────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="bg-card-bg border border-border rounded-xl p-10 text-center">
      <div className="text-5xl mb-4">💉</div>
      <h3 className="text-lg font-semibold mb-2">Sin protocolos configurados</h3>
      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
        Los protocolos definen cuándo y cómo notificar a los tutores. Una vez creados,
        el sistema los aplica automaticamente al registrar vacunas o tratamientos.
      </p>

      {/* Ejemplo visual */}
      <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-800 mb-6">
        <span className="font-semibold">Canino</span>
        <span className="text-blue-400">→</span>
        <span>Antirrábica</span>
        <span className="text-blue-400">→</span>
        <span>cada 365 dias</span>
        <span className="text-blue-400">→</span>
        <span>aviso 7 dias antes</span>
      </div>

      <div>
        <button
          onClick={onNew}
          className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          + Crear primer protocolo
        </button>
      </div>
    </div>
  );
}

// ─── Sección de alertas activas ──────────────────────────────────────────────

function getDaysRemaining(dateStr: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

const EVENT_LABEL: Record<string, string> = {
  VACCINE: "Vacuna", DEWORMING: "Desparasitación", ANTIPARASITIC: "Antiparasitario",
  CHECKUP: "Revisión", OTHER: "Otro",
};

function daysLabel(days: number): string {
  if (days < 0) return `Vencido hace ${Math.abs(days)}d`;
  if (days === 0) return "Hoy";
  if (days < 30) return `En ${days} días`;
  if (days < 365) return `En ${Math.round(days / 30)} meses`;
  const years = Math.floor(days / 365);
  const months = Math.round((days % 365) / 30);
  return months > 0 ? `En ${years} año${years > 1 ? "s" : ""} y ${months} mes${months > 1 ? "es" : ""}` : `En ${years} año${years > 1 ? "s" : ""}`;
}

function ActiveAlerts({ reminders }: { reminders: Reminder[] }) {
  const sorted = [...reminders].sort(
    (a, b) => new Date(a.calculatedDueDate).getTime() - new Date(b.calculatedDueDate).getTime()
  );

  if (sorted.length === 0) return (
    <div className="bg-card-bg rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
      <p className="mb-1 font-medium">Sin alertas programadas</p>
      <p className="text-xs">Al registrar una atención con fecha de próxima cita, el recordatorio aparece aquí.</p>
    </div>
  );

  return (
    <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-border">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mascota</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tutor</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Próxima fecha</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tiempo restante</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const days = getDaysRemaining(r.calculatedDueDate);
            const isOverdue = days < 0;
            const isUrgent = days >= 0 && days <= 7;
            return (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.pet?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{r.pet?.species}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {r.pet?.client?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                    r.eventType === "VACCINE"      ? "bg-green-100 text-green-800 border-green-300" :
                    r.eventType === "DEWORMING"    ? "bg-orange-100 text-orange-800 border-orange-300" :
                    r.eventType === "ANTIPARASITIC"? "bg-purple-100 text-purple-800 border-purple-300" :
                    r.eventType === "CHECKUP"      ? "bg-blue-100 text-blue-800 border-blue-300" :
                                                     "bg-gray-100 text-gray-700 border-gray-300"
                  }`}>
                    {EVENT_LABEL[r.eventType] ?? r.eventType}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatShortDate(r.calculatedDueDate)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isOverdue ? "bg-red-100 text-red-800" :
                    isUrgent  ? "bg-orange-100 text-orange-800" :
                                "bg-green-100 text-green-800"
                  }`}>
                    {daysLabel(days)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<VaccinationProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VaccinationProtocol | undefined>(undefined);
  const [pageError, setPageError] = useState("");
  const [allReminders, setAllReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<"protocols" | "alerts">("protocols");

  async function loadProtocols() {
    try {
      setLoading(true);
      setPageError("");
      const [data, scheduled, sent] = await Promise.all([
        listProtocols(),
        listReminders("SCHEDULED"),
        listReminders("SENT"),
      ]);
      setProtocols(data);
      setAllReminders([...scheduled, ...sent]);
    } catch {
      setPageError("No se pudieron cargar los protocolos. Verifica tu conexion.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProtocols();
  }, []);

  async function handleDelete(protocol: VaccinationProtocol) {
    if (protocol.tenantId === null) {
      alert("Los protocolos globales del sistema no pueden eliminarse.");
      return;
    }
    if (!confirm(`Eliminar el protocolo "${protocol.name}"? Esta accion no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteProtocol(protocol.id);
      loadProtocols();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || "Error al eliminar el protocolo");
    }
  }

  function openCreate() {
    setEditing(undefined);
    setShowModal(true);
  }

  function openEdit(protocol: VaccinationProtocol) {
    setEditing(protocol);
    setShowModal(true);
  }

  const activeCount = protocols.filter((p) => p.active).length;

  const totalAlerts = allReminders.length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Protocolos de Vacunacion</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Define cuándo y cómo notificar a los tutores según la especie y tipo de vacuna.
            {!loading && protocols.length > 0 && (
              <span> {activeCount} activo{activeCount !== 1 ? "s" : ""} de {protocols.length} total.</span>
            )}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium whitespace-nowrap"
        >
          + Nuevo Protocolo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        <button
          onClick={() => setActiveTab("protocols")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === "protocols"
              ? "text-primary border-b-2 border-primary -mb-px"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Protocolos
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === "alerts"
              ? "text-primary border-b-2 border-primary -mb-px"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Alertas programadas
          {!loading && totalAlerts > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              allReminders.some(r => getDaysRemaining(r.calculatedDueDate) < 0) ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
            }`}>
              {totalAlerts}
            </span>
          )}
        </button>
      </div>

      {/* Error de carga */}
      {pageError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {pageError}
          <button onClick={loadProtocols} className="ml-3 underline hover:no-underline">Reintentar</button>
        </div>
      )}

      {/* Tab: Protocolos */}
      {activeTab === "protocols" && (
        <>
          {!loading && protocols.length > 0 && <NotificationFlowDiagram />}

          {!loading && !pageError && protocols.length === 0 && (
            <>
              <NotificationFlowDiagram />
              <EmptyState onNew={openCreate} />
            </>
          )}

          {(loading || protocols.length > 0) && (
            <div className="bg-card-bg rounded-xl border border-border overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo vacuna</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Especie</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Raza</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Recurrencia</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Aviso previo</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Seguimiento</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Estado</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                  ) : (
                    protocols.map((protocol) => (
                      <tr key={protocol.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="font-medium">{protocol.name}</p>
                          {protocol.tenantId === null && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">Global</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{protocol.vaccineType}</td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">{protocol.species}</span>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{protocol.breed ?? <span className="italic text-xs">Todas</span>}</td>
                        <td className="px-4 py-4 font-medium">{formatDays(protocol.intervalDays)}</td>
                        <td className="px-4 py-4"><span className="text-amber-700">{protocol.preReminderDays}d antes</span></td>
                        <td className="px-4 py-4"><span className="text-rose-600">+{protocol.postReminderDays}d despues</span></td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${protocol.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {protocol.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => openEdit(protocol)} className="text-primary hover:underline mr-4">Editar</button>
                          {protocol.tenantId !== null ? (
                            <button onClick={() => handleDelete(protocol)} className="text-danger hover:underline">Eliminar</button>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Solo lectura</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab: Alertas */}
      {activeTab === "alerts" && (
        <div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-5 text-sm text-blue-800">
            <p className="font-semibold mb-1">¿Cómo se generan estas alertas?</p>
            <p>Al registrar una atención en una cita (Agenda → Registrar atención) con fecha de próxima cita, el sistema crea automáticamente un recordatorio aquí. El correo al cliente se envía según los días de aviso definidos en el protocolo correspondiente.</p>
          </div>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Cargando...</div>
          ) : (
            <ActiveAlerts reminders={allReminders} />
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProtocolModal
          initial={editing}
          onClose={() => setShowModal(false)}
          onSaved={loadProtocols}
        />
      )}
    </div>
  );
}
