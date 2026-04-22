"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import {
  listReminders,
  getReminderStats,
  getUpcomingReminders,
  getOverdueReminders,
  createReminder,
  type Reminder,
  type ReminderStats,
  type ReminderEventType,
  type ReminderStatus,
  type CreateReminderDto,
} from "@/services/reminders";

// ─── Constantes ───────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<ReminderEventType, string> = {
  VACCINE: "Vacuna",
  DEWORMING: "Desparasitante",
  ANTIPARASITIC: "Antiparasitario",
  CHECKUP: "Revision",
  OTHER: "Otro",
};

const EVENT_TYPE_BADGE: Record<ReminderEventType, string> = {
  VACCINE: "bg-green-100 text-green-800 border-green-300",
  DEWORMING: "bg-orange-100 text-orange-800 border-orange-300",
  ANTIPARASITIC: "bg-purple-100 text-purple-800 border-purple-300",
  CHECKUP: "bg-blue-100 text-blue-800 border-blue-300",
  OTHER: "bg-gray-100 text-gray-700 border-gray-300",
};

const STATUS_LABELS: Record<ReminderStatus, string> = {
  SCHEDULED: "Programado",
  SENT: "Enviado",
  CONFIRMED: "Confirmado",
  EXPIRED: "Vencido",
  CANCELLED: "Cancelado",
};

const STATUS_BADGE: Record<ReminderStatus, string> = {
  SCHEDULED: "bg-yellow-100 text-yellow-800",
  SENT: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  EXPIRED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-700",
};

// ─── Utilidades de fecha ──────────────────────────────────────────────────────

function getDaysRemaining(dueDateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface Pet {
  id: string;
  name: string;
  species: string;
  client: { id: string; name: string };
}

type TabId = "upcoming" | "overdue" | "all";

// ─── Componente de stat card ──────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  loading,
}: {
  label: string;
  value: number;
  color: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-card-bg rounded-xl border border-border p-4 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-7 bg-gray-200 rounded w-12"></div>
      </div>
    );
  }
  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 flex items-center gap-3">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-sm font-bold">{value}</span>
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

// ─── Card de recordatorio ─────────────────────────────────────────────────────

interface ReminderCardProps {
  reminder: Reminder;
  showOverdueBadge?: boolean;
  onResent: () => void;
}

function ReminderCard({ reminder, showOverdueBadge, onResent }: ReminderCardProps) {
  const days = getDaysRemaining(reminder.calculatedDueDate);
  const eventType = reminder.eventType as ReminderEventType;
  const status = reminder.status as ReminderStatus;
  const notificationsSent = (reminder.notifications ?? []).filter(
    (n) => n.status === "SENT" || n.status === "OPENED" || n.status === "CONFIRMED"
  ).length;
  const [resending, setResending] = useState(false);

  async function handleResend() {
    setResending(true);
    try {
      const res = await api.post(`/reminders/${reminder.id}/resend`, {});
      alert(res.data?.message || "Correo enviado correctamente.");
      onResent();
    } catch (err: any) {
      alert(err.response?.data?.message || "No se pudo reenviar el recordatorio.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-sm">{reminder.pet?.name ?? "Mascota"}</p>
          <p className="text-xs text-muted">{reminder.pet?.species}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${EVENT_TYPE_BADGE[eventType]}`}>
          {EVENT_TYPE_LABELS[eventType]}
        </span>
      </div>

      {/* Fecha de vencimiento */}
      <div className="text-sm mb-2">
        <p className="text-xs text-muted">Vencimiento</p>
        <p className="font-medium">{formatDate(reminder.calculatedDueDate)}</p>
      </div>

      {/* Badge de días */}
      {showOverdueBadge ? (
        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300">
          {Math.abs(days)} {Math.abs(days) === 1 ? "dia" : "dias"} vencido
        </span>
      ) : days >= 0 ? (
        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${
          days === 0 ? "bg-red-100 text-red-800 border-red-300"
          : days <= 2 ? "bg-orange-100 text-orange-800 border-orange-300"
          : "bg-green-100 text-green-800 border-green-300"
        }`}>
          {days === 0 ? "Hoy" : `${days} ${days === 1 ? "dia" : "dias"}`}
        </span>
      ) : (
        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300">
          Vencido hace {Math.abs(days)} {Math.abs(days) === 1 ? "dia" : "dias"}
        </span>
      )}

      {/* Estado + reenviar */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        <div className="flex items-center gap-2">
          {notificationsSent > 0 && (
            <span className="text-xs text-muted">
              {notificationsSent} enviada{notificationsSent !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={handleResend}
            disabled={resending}
            title="Reenviar correo ahora"
            className="text-xs px-2 py-1 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {resending ? "..." : "Reenviar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de creación de recordatorio ───────────────────────────────────────

interface CreateModalProps {
  pets: Pet[];
  onClose: () => void;
  onCreated: () => void;
}

function CreateReminderModal({ pets, onClose, onCreated }: CreateModalProps) {
  const [petSearch, setPetSearch] = useState("");
  const [showPetResults, setShowPetResults] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [eventType, setEventType] = useState<ReminderEventType>("VACCINE");
  const [dueDate, setDueDate] = useState("");
  const [petWeightKg, setPetWeightKg] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredPets = petSearch.trim()
    ? pets.filter(
        (p) =>
          p.name.toLowerCase().includes(petSearch.toLowerCase()) ||
          (p.client?.name ?? "").toLowerCase().includes(petSearch.toLowerCase())
      )
    : pets;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPetId) {
      setError("Debes seleccionar una mascota.");
      return;
    }
    if (!dueDate) {
      setError("Debes seleccionar la fecha de vencimiento.");
      return;
    }

    setError(null);
    setSaving(true);

    const dto: CreateReminderDto = {
      petId: selectedPetId,
      eventType,
      calculatedDueDate: new Date(dueDate).toISOString(),
      petWeightKg: petWeightKg ? Number(petWeightKg) : undefined,
    };

    try {
      await createReminder(dto);
      onCreated();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Error al crear el recordatorio.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Nuevo Recordatorio</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          {/* Selector mascota */}
          <div>
            <label className="block text-sm font-medium mb-1">Mascota</label>
            {selectedPetId ? (
              <div className="flex items-center justify-between px-3 py-2 border border-primary rounded-lg bg-primary/5 text-sm">
                <span className="font-medium">
                  {pets.find((p) => p.id === selectedPetId)?.name} —{" "}
                  {pets.find((p) => p.id === selectedPetId)?.client.name}
                </span>
                <button
                  type="button"
                  onClick={() => { setSelectedPetId(""); setPetSearch(""); }}
                  className="text-muted hover:text-red-500 ml-2 text-xs"
                >
                  cambiar
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
                      <p className="px-3 py-2 text-sm text-muted">Sin resultados</p>
                    ) : (
                      filteredPets.slice(0, 8).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-border last:border-0"
                          onClick={() => {
                            setSelectedPetId(p.id);
                            setPetSearch("");
                            setShowPetResults(false);
                          }}
                        >
                          <span className="font-medium">{p.name}</span>
                          <span className="text-muted ml-1">({p.species})</span>
                          <span className="text-muted ml-1">— {p.client.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tipo de evento */}
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de evento</label>
            <select
              required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as ReminderEventType)}
            >
              {(Object.keys(EVENT_TYPE_LABELS) as ReminderEventType[]).map((t) => (
                <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de vencimiento</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>

          {/* Peso de la mascota (opcional, útil para dosificación) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Peso de la mascota (kg) <span className="text-muted text-xs font-normal">— opcional</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="12.5"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              value={petWeightKg}
              onChange={(e) => setPetWeightKg(e.target.value)}
            />
            <p className="text-xs text-muted mt-1">
              Se usa para calcular dosis en desparasitantes y antiparasitarios.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Crear Recordatorio"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tabla de todos los recordatorios ────────────────────────────────────────

function AllRemindersTable({ reminders }: { reminders: Reminder[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = reminders.filter(
    (r) => statusFilter === "ALL" || r.status === statusFilter
  );

  const allStatuses: { value: string; label: string }[] = [
    { value: "ALL", label: "Todos" },
    { value: "SCHEDULED", label: "Programados" },
    { value: "SENT", label: "Enviados" },
    { value: "CONFIRMED", label: "Confirmados" },
    { value: "EXPIRED", label: "Vencidos" },
    { value: "CANCELLED", label: "Cancelados" },
  ];

  return (
    <div>
      {/* Filtros de estado */}
      <div className="flex gap-2 flex-wrap mb-4">
        {allStatuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              statusFilter === s.value
                ? "bg-primary text-white border-primary"
                : "border-border text-muted hover:bg-gray-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted text-sm">
          No hay recordatorios con este estado.
        </div>
      ) : (
        <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted">Mascota</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Vencimiento</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Dias</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Notif.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const days = getDaysRemaining(r.calculatedDueDate);
                const eventType = r.eventType as ReminderEventType;
                const status = r.status as ReminderStatus;
                const notifSent = (r.notifications ?? []).filter(
                  (n) => n.status === "SENT" || n.status === "OPENED" || n.status === "CONFIRMED"
                ).length;

                return (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.pet?.name ?? "—"}</p>
                      <p className="text-xs text-muted">{r.pet?.species}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${EVENT_TYPE_BADGE[eventType]}`}
                      >
                        {EVENT_TYPE_LABELS[eventType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(r.calculatedDueDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          days < 0
                            ? "text-red-600"
                            : days <= 3
                            ? "text-orange-600"
                            : "text-green-700"
                        }`}
                      >
                        {days === 0 ? "Hoy" : days > 0 ? `+${days}d` : `${days}d`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{notifSent}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState<TabId>("upcoming");
  const [pets, setPets] = useState<Pet[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [upcoming, setUpcoming] = useState<Reminder[]>([]);
  const [overdue, setOverdue] = useState<Reminder[]>([]);
  const [all, setAll] = useState<Reminder[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [sending, setSending] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await getReminderStats();
      setStats(data);
    } catch {
      setStats({ total: 0, upcoming: 0, overdue: 0, notificationsSentToday: 0 });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadLists = useCallback(async () => {
    setLoadingList(true);
    try {
      const [upcomingData, overdueData, allData, petsData] = await Promise.all([
        getUpcomingReminders(7),
        getOverdueReminders(),
        listReminders(),
        api.get<Pet[]>("/pets").then((r) => r.data).catch(() => []),
      ]);
      setUpcoming(upcomingData);
      setOverdue(overdueData);
      setAll(allData);
      setPets(petsData);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || "Error al cargar recordatorios.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadLists();
  }, [loadStats, loadLists]);

  async function handleAfterCreate() {
    await Promise.all([loadStats(), loadLists()]);
  }

  async function handleSendNow() {
    setSending(true);
    try {
      await api.post("/reminders/scheduler/process-pending");
      await Promise.all([loadStats(), loadLists()]);
      alert("Notificaciones procesadas. Revisa tu correo.");
    } catch {
      alert("Error al procesar notificaciones.");
    } finally {
      setSending(false);
    }
  }

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "upcoming", label: "Proximos 7 dias", count: upcoming.length },
    { id: "overdue", label: "Vencidos", count: overdue.length },
    { id: "all", label: "Todos", count: all.length },
  ];

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Recordatorios</h1>
          <p className="text-muted text-sm mt-1">Vacunas, desparasitantes y revisiones</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSendNow}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <svg className={`w-4 h-4 ${sending ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {sending ? "Enviando..." : "Enviar ahora"}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
          >
            + Nuevo Recordatorio
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total activos"
          value={stats?.total ?? 0}
          color="bg-blue-500"
          loading={loadingStats}
        />
        <StatCard
          label="Proximos 7 dias"
          value={stats?.upcoming ?? 0}
          color="bg-green-500"
          loading={loadingStats}
        />
        <StatCard
          label="Vencidos"
          value={stats?.overdue ?? 0}
          color="bg-red-500"
          loading={loadingStats}
        />
        <StatCard
          label="Notif. enviadas hoy"
          value={stats?.notificationsSentToday ?? 0}
          color="bg-purple-500"
          loading={loadingStats}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary -mb-px"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  tab.id === "overdue"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      {loadingList ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card-bg rounded-xl border border-border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {activeTab === "upcoming" && (
            <div>
              {upcoming.length === 0 ? (
                <div className="text-center py-16 text-muted">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p>No hay recordatorios para los proximos 7 dias</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming
                    .sort(
                      (a, b) =>
                        new Date(a.calculatedDueDate).getTime() -
                        new Date(b.calculatedDueDate).getTime()
                    )
                    .map((r) => (
                      <ReminderCard key={r.id} reminder={r} onResent={handleAfterCreate} />
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "overdue" && (
            <div>
              {overdue.length === 0 ? (
                <div className="text-center py-16 text-muted">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-600 font-medium">Sin recordatorios vencidos</p>
                  <p className="text-xs text-muted mt-1">Todos los recordatorios estan al dia</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overdue
                    .sort(
                      (a, b) =>
                        new Date(a.calculatedDueDate).getTime() -
                        new Date(b.calculatedDueDate).getTime()
                    )
                    .map((r) => (
                      <ReminderCard key={r.id} reminder={r} showOverdueBadge onResent={handleAfterCreate} />
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "all" && <AllRemindersTable reminders={all} />}
        </>
      )}

      {/* Modal de creación */}
      {showCreate && (
        <CreateReminderModal
          pets={pets}
          onClose={() => setShowCreate(false)}
          onCreated={handleAfterCreate}
        />
      )}
    </div>
  );
}
