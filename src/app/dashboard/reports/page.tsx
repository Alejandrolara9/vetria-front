"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getDashboardStats,
  getAppointmentsReport,
  getClientsReport,
  getFinancialReport,
  getInventoryReport,
  getRemindersReport,
  type ReportPeriod,
  type DashboardStats,
  type AppointmentsReport,
  type ClientsReport,
  type FinancialReport,
  type InventoryReport,
  type RemindersReport,
} from "@/services/reports";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthAgoISO(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistio",
  DRAFT: "Borrador",
  ISSUED: "Emitida",
  PAID: "Pagada",
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-gray-200 text-gray-600",
  DRAFT: "bg-gray-100 text-gray-600",
  ISSUED: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  VACCINE: "Vacuna",
  DEWORMING: "Desparasitacion",
  ANTIPARASITIC: "Antiparasitario",
  CHECKUP: "Control",
  OTHER: "Otro",
};

const MOVEMENT_LABELS: Record<string, string> = {
  IN: "Entrada",
  OUT: "Salida",
  ADJUSTMENT: "Ajuste",
};

const MOVEMENT_COLORS: Record<string, string> = {
  IN: "text-green-600",
  OUT: "text-red-600",
  ADJUSTMENT: "text-blue-600",
};

// ─── Componentes base ─────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-5">
      <p className="text-xs text-muted font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color ?? ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-5 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
    </div>
  );
}

function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-border animate-pulse">
              {Array.from({ length: cols }).map((__, j) => (
                <td key={j} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
      No se pudo cargar este informe: {message}
    </div>
  );
}

/** Barra de progreso CSS pura — sin librerías externas */
function ProgressBar({
  value,
  max,
  color = "bg-primary",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted w-8 text-right">{pct}%</span>
    </div>
  );
}

/** Barra simple para gráfica de ingresos por semana */
function RevenueBar({
  amount,
  maxAmount,
  label,
}: {
  amount: number;
  maxAmount: number;
  label: string;
}) {
  const pct = maxAmount > 0 ? Math.min(100, (amount / maxAmount) * 100) : 0;
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col items-center" style={{ width: "48px" }}>
        <span className="text-xs text-muted mb-1">{formatCurrency(amount)}</span>
        <div className="w-full bg-gray-100 rounded-t relative" style={{ height: "80px" }}>
          <div
            className="absolute bottom-0 w-full bg-primary rounded-t transition-all"
            style={{ height: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-muted mt-1 truncate max-w-full">{label}</span>
      </div>
    </div>
  );
}

// ─── Tab 1: Dashboard ejecutivo ───────────────────────────────────────────────

function DashboardTab() {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await getDashboardStats(period));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const periodLabel: Record<ReportPeriod, string> = {
    week: "Esta semana",
    month: "Este mes",
    year: "Este ano",
  };

  const totalInvoices = data
    ? Object.values(data.invoicesByStatus).reduce((a, b) => a + b, 0)
    : 0;
  const totalAppts = data?.appointmentsCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <div className="flex gap-2">
        {(["week", "month", "year"] as ReportPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              period === p
                ? "bg-primary text-white border-primary"
                : "border-border text-muted hover:bg-gray-50"
            }`}
          >
            {periodLabel[p]}
          </button>
        ))}
      </div>

      {error && <ErrorBanner message={error} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard
              label="Citas"
              value={data?.appointmentsCount ?? 0}
              sub={`en ${periodLabel[period].toLowerCase()}`}
            />
            <KpiCard
              label="Clientes nuevos"
              value={data?.newClients ?? 0}
              sub={`en ${periodLabel[period].toLowerCase()}`}
              color="text-blue-600"
            />
            <KpiCard
              label="Mascotas nuevas"
              value={data?.newPets ?? 0}
              sub={`en ${periodLabel[period].toLowerCase()}`}
              color="text-purple-600"
            />
            <KpiCard
              label="Ingresos"
              value={formatCurrency(data?.revenueTotal ?? 0)}
              sub="facturas pagadas"
              color="text-green-700"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Citas por estado */}
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Citas por estado</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : data && totalAppts > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.appointmentsByStatus).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">
                      {STATUS_LABELS[status] ?? status}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <ProgressBar value={count} max={totalAppts} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">Sin datos en este periodo</p>
          )}
        </div>

        {/* Servicios más solicitados */}
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Servicios mas solicitados</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : data && data.topServices.length > 0 ? (
            <div className="space-y-3">
              {data.topServices.map((svc, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm truncate max-w-xs">{svc.title}</span>
                  <span className="text-sm font-semibold ml-4 flex-shrink-0">
                    {svc.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">Sin datos en este periodo</p>
          )}
        </div>
      </div>

      {/* Facturacion por estado */}
      {!loading && data && totalInvoices > 0 && (
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Facturacion por estado</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.invoicesByStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                    STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {STATUS_LABELS[status] ?? status}
                </span>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs text-muted">
                  {totalInvoices > 0
                    ? `${Math.round((count / totalInvoices) * 100)}%`
                    : "0%"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Citas ─────────────────────────────────────────────────────────────

function AppointmentsTab() {
  const [from, setFrom] = useState(monthAgoISO());
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState<AppointmentsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await getAppointmentsReport(from, to));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const total = data?.totals.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Filtros de fecha */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-muted font-medium mb-1">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted font-medium mb-1">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Resumen */}
      {!loading && data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Total citas" value={total} />
          <KpiCard
            label="Completadas"
            value={data.totals.byStatus["COMPLETED"] ?? 0}
            color="text-green-600"
          />
          <KpiCard
            label="Canceladas"
            value={data.totals.byStatus["CANCELLED"] ?? 0}
            color="text-red-600"
          />
          <KpiCard
            label="No asistio"
            value={data.totals.byStatus["NO_SHOW"] ?? 0}
            color="text-orange-600"
          />
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : (
        <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <p className="text-sm text-muted">
              {total} cita{total !== 1 ? "s" : ""} en el rango seleccionado
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-muted">Fecha</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Servicio</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Mascota</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Cliente</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Veterinario</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data?.appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted">
                      No hay citas en el rango seleccionado
                    </td>
                  </tr>
                ) : (
                  data?.appointments.map((appt) => (
                    <tr
                      key={appt.id}
                      className="border-b border-border last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-3 whitespace-nowrap">
                        <p className="font-medium">{formatDate(appt.date)}</p>
                        <p className="text-xs text-muted">
                          {appt.startTime} - {appt.endTime}
                        </p>
                      </td>
                      <td className="px-6 py-3">{appt.title}</td>
                      <td className="px-6 py-3">
                        {appt.pet ? (
                          <span>
                            {appt.pet.name}{" "}
                            <span className="text-muted text-xs">
                              ({appt.pet.species})
                            </span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-3">{appt.client?.name ?? "—"}</td>
                      <td className="px-6 py-3">{appt.vet?.name ?? "—"}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[appt.status] ??
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABELS[appt.status] ?? appt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Clientes y mascotas ───────────────────────────────────────────────

function ClientsTab() {
  const [data, setData] = useState<ClientsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getClientsReport()
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Error desconocido")
      )
      .finally(() => setLoading(false));
  }, []);

  const maxSpeciesCount = data?.topSpecies[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard label="Total clientes" value={data?.totalClients ?? 0} />
            <KpiCard
              label="Total mascotas"
              value={data?.totalPets ?? 0}
              color="text-purple-600"
            />
            <KpiCard
              label="Promedio mascotas/cliente"
              value={data?.avgPetsPerClient ?? 0}
              sub="por cliente registrado"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Especies más frecuentes */}
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Especies mas frecuentes</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : data && data.topSpecies.length > 0 ? (
            <div className="space-y-3">
              {data.topSpecies.map((s) => (
                <div key={s.species}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{s.species}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                  <ProgressBar value={s.count} max={maxSpeciesCount} color="bg-purple-500" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">Sin datos</p>
          )}
        </div>

        {/* Top 5 clientes con más mascotas */}
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Top clientes con mas mascotas</h3>
          {loading ? (
            <SkeletonTable rows={5} cols={3} />
          ) : data && data.topClients.length > 0 ? (
            <div className="space-y-2">
              {data.topClients.map((client, idx) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{client.name}</p>
                      <p className="text-xs text-muted">{client.email}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {client.petCount} mascotas
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">Sin datos</p>
          )}
        </div>
      </div>

      {/* Mascotas sin cita en 90 días */}
      {!loading && data && data.petsWithoutRecentAppointment.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-yellow-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="font-semibold text-yellow-800">
              {data.petsWithoutRecentAppointment.length} mascotas sin cita en los
              ultimos 90 dias
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-yellow-200">
                  <th className="text-left py-2 font-medium text-yellow-700">Mascota</th>
                  <th className="text-left py-2 font-medium text-yellow-700">Especie</th>
                  <th className="text-left py-2 font-medium text-yellow-700">Tutor</th>
                  <th className="text-left py-2 font-medium text-yellow-700">Ultima cita</th>
                </tr>
              </thead>
              <tbody>
                {data.petsWithoutRecentAppointment.slice(0, 20).map((pet) => (
                  <tr
                    key={pet.id}
                    className="border-b border-yellow-100 last:border-0"
                  >
                    <td className="py-2 font-medium">{pet.name}</td>
                    <td className="py-2 capitalize">{pet.species}</td>
                    <td className="py-2">{pet.ownerName}</td>
                    <td className="py-2 text-muted">
                      {pet.lastAppointmentDate
                        ? formatDate(pet.lastAppointmentDate)
                        : "Nunca"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.petsWithoutRecentAppointment.length > 20 && (
              <p className="text-xs text-yellow-600 mt-2">
                ...y {data.petsWithoutRecentAppointment.length - 20} mas
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 4: Financiero ────────────────────────────────────────────────────────

function FinancialTab() {
  const [from, setFrom] = useState(monthAgoISO());
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await getFinancialReport(from, to));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const maxRevenue = data
    ? Math.max(...data.revenueByPeriod.map((p) => p.amount), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-muted font-medium mb-1">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted font-medium mb-1">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* KPIs financieros */}
      <div className="grid grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard
              label="Total facturado"
              value={formatCurrency(
                (data?.totals.totalIssued ?? 0) + (data?.totals.totalPaid ?? 0)
              )}
              sub="emitidas + pagadas"
            />
            <KpiCard
              label="Total cobrado"
              value={formatCurrency(data?.totals.totalPaid ?? 0)}
              sub="facturas PAID"
              color="text-green-700"
            />
            <KpiCard
              label="Pendiente de cobro"
              value={formatCurrency(data?.totals.totalIssued ?? 0)}
              sub="facturas ISSUED"
              color="text-orange-600"
            />
          </>
        )}
      </div>

      {/* Grafica de ingresos por semana — CSS puro */}
      {!loading && data && data.revenueByPeriod.length > 0 && (
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Ingresos por semana (pagados)</h3>
          <div className="flex items-end gap-3 overflow-x-auto pb-2">
            {data.revenueByPeriod.map((item) => (
              <RevenueBar
                key={item.period}
                amount={item.amount}
                maxAmount={maxRevenue}
                label={item.period.slice(5)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabla de facturas */}
      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : (
        <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <p className="text-sm text-muted">
              {data?.invoices.length ?? 0} factura
              {(data?.invoices.length ?? 0) !== 1 ? "s" : ""} en el rango
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-muted">N°</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Cliente</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Mascota</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Fecha</th>
                  <th className="text-right px-6 py-3 font-medium text-muted">Total</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data?.invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted">
                      No hay facturas en el rango seleccionado
                    </td>
                  </tr>
                ) : (
                  data?.invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-border last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-3 font-mono text-xs font-semibold">
                        {inv.number}
                      </td>
                      <td className="px-6 py-3">{inv.clientName}</td>
                      <td className="px-6 py-3">{inv.petName ?? "—"}</td>
                      <td className="px-6 py-3 text-muted">
                        {formatDate(inv.issuedAt)}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[inv.status] ??
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABELS[inv.status] ?? inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 5: Inventario ────────────────────────────────────────────────────────

function InventoryTab() {
  const [data, setData] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getInventoryReport()
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Error desconocido")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard
              label="Productos activos"
              value={data?.totalActiveProducts ?? 0}
            />
            <KpiCard
              label="Bajo stock minimo"
              value={data?.lowStockCount ?? 0}
              sub="requieren reabastecimiento"
              color={
                (data?.lowStockCount ?? 0) > 0 ? "text-red-600" : "text-green-600"
              }
            />
            <KpiCard
              label="Valor total stock"
              value={formatCurrency(data?.totalStockValue ?? 0)}
              sub="precio de costo"
              color="text-green-700"
            />
          </>
        )}
      </div>

      {/* Productos bajo stock mínimo */}
      {!loading && data && data.lowStockProducts.length > 0 && (
        <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <h3 className="font-semibold text-red-700">
              Productos con stock bajo ({data.lowStockProducts.length})
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-muted">Producto</th>
                <th className="text-left px-6 py-3 font-medium text-muted">Categoria</th>
                <th className="text-right px-6 py-3 font-medium text-muted">Stock actual</th>
                <th className="text-right px-6 py-3 font-medium text-muted">Stock minimo</th>
                <th className="text-right px-6 py-3 font-medium text-muted">Costo unit.</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockProducts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 bg-red-50/30"
                >
                  <td className="px-6 py-3 font-medium">{p.name}</td>
                  <td className="px-6 py-3 text-muted text-xs">{p.category}</td>
                  <td className="px-6 py-3 text-right font-semibold text-red-600">
                    {p.stock} {p.unit}
                  </td>
                  <td className="px-6 py-3 text-right text-muted">
                    {p.minStock} {p.unit}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {formatCurrency(p.costPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Movimientos recientes */}
      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : (
        <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold">Movimientos recientes (30 dias)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-muted">Producto</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Tipo</th>
                  <th className="text-right px-6 py-3 font-medium text-muted">Cantidad</th>
                  <th className="text-right px-6 py-3 font-medium text-muted">Stock resultante</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Motivo</th>
                  <th className="text-left px-6 py-3 font-medium text-muted">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted">
                      Sin movimientos en los ultimos 30 dias
                    </td>
                  </tr>
                ) : (
                  data?.recentMovements.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-border last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-3 font-medium">{m.productName}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-xs font-semibold ${
                            MOVEMENT_COLORS[m.type] ?? ""
                          }`}
                        >
                          {MOVEMENT_LABELS[m.type] ?? m.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-medium">
                        {m.type === "IN" ? "+" : m.type === "OUT" ? "-" : "="}
                        {m.quantity}
                      </td>
                      <td className="px-6 py-3 text-right text-muted">
                        {m.stockAfter}
                      </td>
                      <td className="px-6 py-3 text-muted text-xs">
                        {m.reason ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-muted">
                        {formatDate(m.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Productos sin movimiento */}
      {!loading && data && data.productsWithoutMovement.length > 0 && (
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3 text-muted">
            Productos sin movimiento en 30 dias ({data.productsWithoutMovement.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.productsWithoutMovement.map((p) => (
              <span
                key={p.id}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                {p.name} ({p.stock})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 6: Recordatorios ─────────────────────────────────────────────────────

function RemindersTab() {
  const [from, setFrom] = useState(monthAgoISO());
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState<RemindersReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await getRemindersReport(from, to));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const notif = data?.notifications;
  const overall = data?.overallStats;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-muted font-medium mb-1">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted font-medium mb-1">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* KPIs de notificaciones */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard label="Total enviados" value={notif?.sent ?? 0} />
            <KpiCard
              label="Abiertos"
              value={notif?.opened ?? 0}
              sub={`${notif?.openRate ?? 0}% de apertura`}
              color="text-blue-600"
            />
            <KpiCard
              label="Confirmados"
              value={notif?.confirmed ?? 0}
              sub={`${notif?.confirmRate ?? 0}% de confirmacion`}
              color="text-green-600"
            />
            <KpiCard
              label="Tasa de confirmacion"
              value={`${overall?.confirmationRate ?? 0}%`}
              sub="del total de recordatorios"
              color={
                (overall?.confirmationRate ?? 0) >= 50
                  ? "text-green-600"
                  : "text-orange-600"
              }
            />
          </>
        )}
      </div>

      {/* Tasas visuales */}
      {!loading && notif && notif.sent > 0 && (
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Funnel de notificaciones</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Entregados</span>
                <span className="font-medium">
                  {notif.sent} / {notif.total}
                </span>
              </div>
              <ProgressBar
                value={notif.sent}
                max={notif.total}
                color="bg-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Abiertos</span>
                <span className="font-medium">
                  {notif.opened} ({notif.openRate}%)
                </span>
              </div>
              <ProgressBar
                value={notif.opened}
                max={notif.sent}
                color="bg-yellow-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Confirmados</span>
                <span className="font-medium">
                  {notif.confirmed} ({notif.confirmRate}%)
                </span>
              </div>
              <ProgressBar
                value={notif.confirmed}
                max={notif.sent}
                color="bg-green-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabla por tipo de evento */}
      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : (
        <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold">Recordatorios por tipo de evento</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-muted">Tipo</th>
                <th className="text-right px-6 py-3 font-medium text-muted">Total</th>
                <th className="text-right px-6 py-3 font-medium text-muted">Programados</th>
                <th className="text-right px-6 py-3 font-medium text-muted">Enviados</th>
                <th className="text-right px-6 py-3 font-medium text-muted">Confirmados</th>
                <th className="text-right px-6 py-3 font-medium text-muted">Vencidos</th>
              </tr>
            </thead>
            <tbody>
              {data?.byEventType.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted">
                    Sin recordatorios en el rango seleccionado
                  </td>
                </tr>
              ) : (
                data?.byEventType.map((row) => (
                  <tr
                    key={row.eventType}
                    className="border-b border-border last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 font-medium">
                      {EVENT_TYPE_LABELS[row.eventType] ?? row.eventType}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {row.total}
                    </td>
                    <td className="px-6 py-3 text-right text-muted">
                      {row.scheduled}
                    </td>
                    <td className="px-6 py-3 text-right text-blue-600">
                      {row.sent}
                    </td>
                    <td className="px-6 py-3 text-right text-green-600">
                      {row.confirmed}
                    </td>
                    <td className="px-6 py-3 text-right text-red-500">
                      {row.expired}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Pagina principal ─────────────────────────────────────────────────────────

type TabKey =
  | "dashboard"
  | "appointments"
  | "clients"
  | "financial"
  | "inventory"
  | "reminders";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "appointments", label: "Citas" },
  { key: "clients", label: "Clientes y Mascotas" },
  { key: "financial", label: "Financiero" },
  { key: "inventory", label: "Inventario" },
  { key: "reminders", label: "Recordatorios" },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Informes y Analitica</h1>
        <p className="text-muted text-sm mt-1">
          Datos en tiempo real de tu clinica veterinaria
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido del tab activo */}
      {activeTab === "dashboard" && <DashboardTab />}
      {activeTab === "appointments" && <AppointmentsTab />}
      {activeTab === "clients" && <ClientsTab />}
      {activeTab === "financial" && <FinancialTab />}
      {activeTab === "inventory" && <InventoryTab />}
      {activeTab === "reminders" && <RemindersTab />}
    </div>
  );
}
