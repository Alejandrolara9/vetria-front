"use client";

import { useState, useCallback } from "react";
import { api } from "@/services/api";
import PasswordStrengthChecklist, { isPasswordStrong } from "@/components/PasswordStrengthChecklist";
import { usePagination } from "@/hooks/usePagination";
import { SearchInput } from "@/components/SearchInput";
import { PaginationBar } from "@/components/PaginationBar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { PaginatedResponse } from "@/types/pagination";

type Role = "ADMIN" | "VET" | "RECEPTIONIST";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  VET: "Veterinario",
  RECEPTIONIST: "Recepcionista",
};

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  VET: "bg-blue-100 text-blue-700",
  RECEPTIONIST: "bg-green-100 text-green-700",
};

export default function TeamPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "VET" as Role });
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", role: "VET" as Role });
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchTeam = useCallback(
    async (pg: number, lim: number, srch: string, signal: AbortSignal) => {
      const params = new URLSearchParams({
        page: String(pg),
        limit: String(lim),
        ...(srch ? { search: srch } : {}),
      });
      const res = await api.get<PaginatedResponse<TeamMember>>(`/users?${params}`, { signal });
      return res.data;
    },
    [refreshKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const {
    data: members,
    total,
    page,
    totalPages,
    search,
    loading,
    setSearch,
    setPage,
  } = usePagination<TeamMember>({ fetchFn: fetchTeam });

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/users", form);
      setForm({ name: "", email: "", password: "", role: "VET" });
      setShowForm(false);
      handleRefresh();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Error al crear usuario");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(member: TeamMember) {
    setEditingMember(member);
    setEditForm({ name: member.name, email: member.email, password: "", role: member.role });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMember) return;
    setSubmitting(true);
    try {
      const payload: Record<string, string> = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };
      if (editForm.password) payload.password = editForm.password;
      await api.patch(`/users/${editingMember.id}`, payload);
      setEditingMember(null);
      handleRefresh();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Error al actualizar usuario");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    setMemberToDelete({ id, name });
    setDeleteConfirmOpen(true);
  }

  async function doDelete() {
    if (!memberToDelete) return;
    setDeleteConfirmOpen(false);
    try {
      await api.delete(`/users/${memberToDelete.id}`);
      setMemberToDelete(null);
      handleRefresh();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Error al eliminar");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Equipo</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o email..."
          disabled={loading}
        />
      </div>

      {/* Modal de creación */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Crear usuario</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Dr. Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="dr.juan@clinica.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mínimo 8 caracteres"
                />
                {form.password && (
                  <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border">
                    <PasswordStrengthChecklist
                      password={form.password}
                      className="[&_li]:text-gray-500 [&_li.text-green-400]:text-green-600"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="VET">Veterinario</option>
                  <option value="RECEPTIONIST">Recepcionista</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isPasswordStrong(form.password)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "Creando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Editar usuario</h2>
              <button onClick={() => setEditingMember(null)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nueva contraseña <span className="text-muted-foreground font-normal">(dejar vacío para no cambiar)</span>
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mínimo 8 caracteres"
                />
                {editForm.password && (
                  <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border">
                    <PasswordStrengthChecklist
                      password={editForm.password}
                      className="[&_li]:text-gray-500 [&_li.text-green-400]:text-green-600"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="VET">Veterinario</option>
                  <option value="RECEPTIONIST">Recepcionista</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!!editForm.password && !isPasswordStrong(editForm.password))}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading && members.length === 0 ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>{search ? "No se encontraron usuarios con esa búsqueda" : "No hay usuarios registrados"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border divide-y">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[member.role]}`}>
                  {ROLE_LABELS[member.role]}
                </span>
                <button
                  onClick={() => startEdit(member)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        loading={loading}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`¿Eliminar a ${memberToDelete?.name}?`}
        variant="danger"
        onConfirm={doDelete}
        onClose={() => { setDeleteConfirmOpen(false); setMemberToDelete(null); }}
      />
    </div>
  );
}
