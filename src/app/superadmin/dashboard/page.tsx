"use client";

import { useEffect, useState } from "react";
import {
  fetchTenants,
  fetchStats,
  updateTenant,
  fetchTenantUsers,
  fetchCreditRequests,
  confirmCreditRequest,
  rejectCreditRequest,
  addCreditsAdmin,
  setGracePeriod,
  TenantSummary,
  TenantUser,
  PlatformStats,
  CreditRequest,
} from "@/services/superadmin.service";
import { COLOMBIA_DEPARTMENTS } from "@/lib/colombia-locations";
import SearchableSelect from "@/components/SearchableSelect";

const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-blue-100 text-blue-700",
  PRO: "bg-purple-100 text-purple-700",
};

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<"" | "FREE" | "BASIC" | "PRO">("");
  const [filterActive, setFilterActive] = useState<"" | "true" | "false">("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const [editTarget, setEditTarget] = useState<TenantSummary | null>(null);
  const [editUsers, setEditUsers] = useState<TenantUser[]>([]);
  const [editPlan, setEditPlan] = useState<"FREE" | "BASIC" | "PRO">("BASIC");
  const [editActive, setEditActive] = useState(true);
  const [editCredits, setEditCredits] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const [editGraceDays, setEditGraceDays] = useState("");
  const [graceSubmitting, setGraceSubmitting] = useState(false);

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);
  const [creditRequestError, setCreditRequestError] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [t, s, cr] = await Promise.all([fetchTenants(), fetchStats(), fetchCreditRequests()]);
      setTenants(t);
      setStats(s);
      setCreditRequests(cr);
    } catch {
      // 401 → interceptor redirects to login automatically
    } finally {
      setLoading(false);
    }
  }

  async function openEdit(tenant: TenantSummary) {
    setEditTarget(tenant);
    setEditPlan(tenant.plan);
    setEditActive(tenant.active);
    setEditCredits("");
    setEditError("");
    setEditUsers([]);
    const users = await fetchTenantUsers(tenant.id);
    setEditUsers(users);
  }

  async function handleGracePeriod() {
    if (!editTarget || !editGraceDays) return;
    const days = parseInt(editGraceDays);
    if (isNaN(days) || days < 1) return;
    setGraceSubmitting(true);
    try {
      await setGracePeriod(editTarget.id, days);
      setEditGraceDays("");
      loadAll();
    } catch {
      setEditError("Error al otorgar período de gracia");
    } finally {
      setGraceSubmitting(false);
    }
  }

  function closeEdit() {
    setEditTarget(null);
    setEditUsers([]);
    setEditError("");
    setEditCredits("");
    setEditGraceDays("");
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSubmitting(true);
    setEditError("");
    try {
      await updateTenant(editTarget.id, { plan: editPlan, active: editActive });
      if (editCredits && parseInt(editCredits) > 0) {
        await addCreditsAdmin(editTarget.id, parseInt(editCredits), "Ajuste manual superadmin");
      }
      closeEdit();
      loadAll();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setEditError(axiosErr.response?.data?.message || "Error al actualizar");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleRejectRequest(reqId: string) {
    setRejectingId(reqId);
    setPendingRejectId(null);
    setCreditRequestError(null);
    try {
      await rejectCreditRequest(reqId);
      setCreditRequests((prev) => prev.filter((r) => r.id !== reqId));
    } catch {
      setCreditRequestError("Error al rechazar la solicitud");
      setRejectingId(null);
    }
  }

  async function handleConfirmRequest(req: CreditRequest) {
    setConfirmingId(req.id);
    setCreditRequestError(null);
    try {
      await confirmCreditRequest(req.id);
      setCreditRequests((prev) => prev.filter((r) => r.id !== req.id));
      const updated = await fetchTenants();
      setTenants(updated);
    } catch {
      setCreditRequestError("Error al confirmar la solicitud");
    } finally {
      setConfirmingId(null);
    }
  }

  const filtered = tenants.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPlan && t.plan !== filterPlan) return false;
    if (filterActive !== "" && String(t.active) !== filterActive) return false;
    if (filterDepartment && t.clinicDepartment !== filterDepartment) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Panel de plataforma</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen de clínicas registradas en Vetria</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total clínicas", value: stats.totalTenants },
            { label: "Clínicas activas", value: stats.activeTenants },
            { label: "Total usuarios", value: stats.totalUsers },
            { label: "Total mascotas", value: stats.totalPets },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {creditRequestError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {creditRequestError}
        </div>
      )}

      {/* Pending credit requests */}
      {creditRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Solicitudes de recarga pendientes ({creditRequests.length})
          </h2>
          <div className="space-y-2">
            {creditRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-lg border border-amber-100 flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-gray-900">{req.tenant.name}</span>
                  <span className="text-muted-foreground ml-2">
                    Plan {req.tenant.plan} · {req.tenant.creditBalance} créditos actuales
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-blue-700">+{req.credits} créditos</p>
                    <p className="text-xs text-muted-foreground">
                      ${req.paidAmountCOP.toLocaleString("es-CO")} COP
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                  {pendingRejectId === req.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-700 font-medium">¿Rechazar?</span>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setPendingRejectId(null)}
                        className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPendingRejectId(req.id)}
                      disabled={rejectingId === req.id || confirmingId === req.id}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50"
                    >
                      {rejectingId === req.id ? "Rechazando..." : "Rechazar"}
                    </button>
                  )}
                  <button
                    onClick={() => handleConfirmRequest(req)}
                    disabled={confirmingId === req.id || rejectingId === req.id}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {confirmingId === req.id ? "Confirmando..." : "Confirmar pago"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar clínica..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-56"
        />
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value as "" | "FREE" | "BASIC" | "PRO")}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos los planes</option>
          <option value="FREE">FREE</option>
          <option value="BASIC">BASIC</option>
          <option value="PRO">PRO</option>
        </select>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value as "" | "true" | "false")}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
        <SearchableSelect
          options={COLOMBIA_DEPARTMENTS.map((d) => d.name)}
          value={filterDepartment}
          onChange={setFilterDepartment}
          placeholder="Filtrar por departamento..."
          variant="light"
          className="w-52"
        />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Clínica</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ubicación</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Créditos IA</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Usuarios</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Mascotas</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Citas</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Registro</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {t.clinicDepartment ? (
                    <span>
                      {t.clinicCity ? `${t.clinicCity}, ` : ""}{t.clinicDepartment}
                    </span>
                  ) : (
                    <span className="text-xs italic opacity-40">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${PLAN_COLORS[t.plan]}`}>
                    {t.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    t.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {t.active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-medium ${
                    (t.creditBalance ?? 0) >= 50
                      ? "text-green-600"
                      : (t.creditBalance ?? 0) >= 10
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}>
                    {t.creditBalance ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{t._count.users}</td>
                <td className="px-4 py-3 text-right">{t._count.pets}</td>
                <td className="px-4 py-3 text-right">{t._count.appointments}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(t.createdAt).toLocaleDateString("es-CL")}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openEdit(t)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No hay clínicas que coincidan con los filtros
          </div>
        )}
      </div>

      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editTarget.name}</h2>
              <button onClick={closeEdit} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editUsers.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Usuarios ({editUsers.length})</p>
                <div className="bg-gray-50 rounded-lg divide-y max-h-36 overflow-y-auto">
                  {editUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span>{u.name}</span>
                      <span className="text-muted-foreground text-xs">{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Plan</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value as "FREE" | "BASIC" | "PRO")}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="FREE">FREE</option>
                  <option value="BASIC">BASIC</option>
                  <option value="PRO">PRO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ajustar créditos IA
                </label>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">Balance actual:</span>
                  <span className={`text-sm font-semibold ${
                    (editTarget.creditBalance ?? 0) >= 50 ? "text-green-600"
                    : (editTarget.creditBalance ?? 0) >= 10 ? "text-amber-600"
                    : "text-red-600"
                  }`}>
                    {editTarget.creditBalance ?? 0} créditos
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={-10000}
                    max={10000}
                    placeholder="Ej: +100 o -50"
                    value={editCredits}
                    onChange={(e) => setEditCredits(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {editCredits && parseInt(editCredits) !== 0 && (
                    <span className={`self-center text-xs font-medium px-2 py-1 rounded-full ${
                      parseInt(editCredits) > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {parseInt(editCredits) > 0 ? "+" : ""}{editCredits} → {(editTarget.creditBalance ?? 0) + parseInt(editCredits)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Usa valores negativos para restar (ej: -50)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Período de gracia
                  {editTarget.gracePeriodEndsAt && (
                    <span className="text-xs text-amber-600 font-normal ml-2">
                      activo hasta {new Date(editTarget.gracePeriodEndsAt).toLocaleDateString("es-CO")}
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    placeholder="Días (ej: 30)"
                    value={editGraceDays}
                    onChange={(e) => setEditGraceDays(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleGracePeriod}
                    disabled={graceSubmitting || !editGraceDays}
                    className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
                  >
                    {graceSubmitting ? "..." : "Otorgar"}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="edit-active" className="text-sm font-medium">
                  Clínica activa
                </label>
              </div>
              {editError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {editError}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeEdit}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={editSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {editSubmitting ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
