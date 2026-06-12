"use client";

import { useState, useCallback } from "react";
import { api } from "@/services/api";
import {
  createService,
  updateService,
  deleteService,
  type Service,
  type CreateServiceDto,
} from "@/services/catalog";
import { usePagination } from "@/hooks/usePagination";
import { SearchInput } from "@/components/SearchInput";
import { PaginationBar } from "@/components/PaginationBar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { PaginatedResponse } from "@/types/pagination";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-t border-gray-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ─── Modal crear / editar servicio ────────────────────────────────────────────

interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  active: boolean;
}

function ServiceModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Service;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ServiceFormData>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price !== undefined ? String(initial.price) : "",
    category: initial?.category ?? "",
    active: initial?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) {
      setError("El precio debe ser un número mayor o igual a 0");
      return;
    }

    const payload: CreateServiceDto = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price,
      category: form.category.trim() || undefined,
      active: form.active,
    };

    try {
      setSaving(true);
      if (initial) {
        await updateService(initial.id, payload);
      } else {
        await createService(payload);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Error al guardar el servicio");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">
            {initial ? "Editar Servicio" : "Nuevo Servicio"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="Ej: Consulta general, Peluquería..."
              className="w-full px-4 py-2 border border-border rounded-lg text-sm"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Precio <span className="text-red-500">*</span>
            </label>
            <input
              name="price"
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-border rounded-lg text-sm"
              value={form.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Categoria <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <input
              name="category"
              type="text"
              placeholder="Ej: Consultas, Grooming, Cirugias..."
              className="w-full px-4 py-2 border border-border rounded-lg text-sm"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripcion <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Descripcion del servicio..."
              className="w-full px-4 py-2 border border-border rounded-lg text-sm resize-none"
              value={form.description}
              onChange={handleChange}
            />
          </div>

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
              Servicio activo
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Guardando..." : initial ? "Guardar cambios" : "Crear Servicio"}
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

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  // undefined = todos, true = activos, false = inactivos
  const [showActive, setShowActive] = useState<boolean | undefined>(undefined);

  const fetchServices = useCallback(
    async (pg: number, lim: number, srch: string, signal: AbortSignal) => {
      const params = new URLSearchParams({
        page: String(pg),
        limit: String(lim),
        ...(srch ? { search: srch } : {}),
        ...(showActive !== undefined ? { active: String(showActive) } : {}),
      });
      const res = await api.get<PaginatedResponse<Service>>(`/services?${params}`, { signal });
      return res.data;
    },
    [showActive, refreshKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const {
    data: services,
    total,
    page,
    totalPages,
    search,
    loading,
    setSearch,
    setPage,
  } = usePagination<Service>({ fetchFn: fetchServices });

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  async function handleDelete(svc: Service) {
    setServiceToDelete(svc);
    setDeleteConfirmOpen(true);
  }

  async function doDelete() {
    if (!serviceToDelete) return;
    setDeleteConfirmOpen(false);
    try {
      await deleteService(serviceToDelete.id);
      setServiceToDelete(null);
      handleRefresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Error al eliminar el servicio");
    }
  }

  function openCreate() {
    setEditingService(undefined);
    setShowModal(true);
  }

  function openEdit(svc: Service) {
    setEditingService(svc);
    setShowModal(true);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Catalogo de Servicios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} servicio{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          + Nuevo Servicio
        </button>
      </div>

      {/* Filtros + búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar servicio por nombre..."
          disabled={loading}
        />
        <select
          className="px-4 py-2 border border-border rounded-lg text-sm bg-white"
          value={showActive === undefined ? "" : String(showActive)}
          onChange={(e) => {
            const val = e.target.value;
            setShowActive(val === "" ? undefined : val === "true");
            setPage(1);
          }}
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      {/* Mobile: cards */}
      {loading && services.length === 0 ? (
        <div className="md:hidden space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="md:hidden text-center py-12 text-muted-foreground">
          {search || showActive !== undefined
            ? "No se encontraron servicios con ese filtro"
            : "No hay servicios registrados. Crea el primero."}
        </div>
      ) : (
        <div className="md:hidden space-y-3">
          {services.map((svc) => (
            <div key={svc.id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-base leading-snug">{svc.name}</p>
                  {svc.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{svc.description}</p>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 mt-0.5 ${svc.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {svc.active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="px-4 pb-4">
                <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                  {svc.category && (
                    <>
                      <span className="text-gray-400 font-medium">Categoría</span>
                      <span className="text-gray-700 truncate">{svc.category}</span>
                    </>
                  )}
                  <span className="text-gray-400 font-medium">Precio</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(svc.price)}</span>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-border flex gap-2">
                <button
                  onClick={() => openEdit(svc)}
                  className="flex-1 inline-flex items-center justify-center text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(svc)}
                  className="flex-1 inline-flex items-center justify-center text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop: tabla */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && services.length === 0 ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  {search || showActive !== undefined
                    ? "No se encontraron servicios con ese filtro"
                    : "No hay servicios registrados. Crea el primero."}
                </td>
              </tr>
            ) : (
              services.map((svc) => (
                <tr key={svc.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{svc.name}</p>
                    {svc.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{svc.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{svc.category ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(svc.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${svc.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {svc.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(svc)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(svc)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        loading={loading}
      />

      {/* Modal */}
      {showModal && (
        <ServiceModal
          initial={editingService}
          onClose={() => setShowModal(false)}
          onSaved={handleRefresh}
        />
      )}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`¿Eliminar el servicio "${serviceToDelete?.name}"?`}
        description="Esta acción no se puede deshacer."
        variant="danger"
        onConfirm={doDelete}
        onClose={() => { setDeleteConfirmOpen(false); setServiceToDelete(null); }}
      />
    </div>
  );
}
