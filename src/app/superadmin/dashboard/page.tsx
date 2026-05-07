"use client";

import { useEffect, useState } from "react";
import {
  fetchTenants,
  fetchStats,
  updateTenant,
  fetchTenantUsers,
  TenantSummary,
  TenantUser,
  PlatformStats,
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<"" | "FREE" | "BASIC" | "PRO">("");
  const [filterActive, setFilterActive] = useState<"" | "true" | "false">("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const [editTarget, setEditTarget] = useState<TenantSummary | null>(null);
  const [editUsers, setEditUsers] = useState<TenantUser[]>([]);
  const [editPlan, setEditPlan] = useState<"FREE" | "BASIC" | "PRO">("BASIC");
  const [editActive, setEditActive] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [t, s] = await Promise.all([fetchTenants(), fetchStats()]);
      setTenants(t);
      setStats(s);
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
    setEditError("");
    setEditUsers([]);
    const users = await fetchTenantUsers(tenant.id);
    setEditUsers(users);
  }

  function closeEdit() {
    setEditTarget(null);
    setEditUsers([]);
    setEditError("");
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSubmitting(true);
    setEditError("");
    try {
      await updateTenant(editTarget.id, { plan: editPlan, active: editActive });
      closeEdit();
      loadAll();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setEditError(axiosErr.response?.data?.message || "Error al actualizar");
    } finally {
      setEditSubmitting(false);
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
        <p className="text-sm text-muted-foreground mt-1">Resumen de clínicas registradas en OKVet</p>
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
