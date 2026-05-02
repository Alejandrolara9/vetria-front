"use client";

import { useEffect, useState } from "react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  type Service,
  type CreateServiceDto,
} from "@/services/catalog";

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
    <tr className="border-b border-border">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-6 py-4">
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar el servicio");
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
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-sm font-medium disabled:opacity-50"
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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);

  async function loadServices() {
    try {
      setLoading(true);
      const data = await getServices(search || undefined);
      setServices(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleDelete(svc: Service) {
    if (!confirm(`Eliminar el servicio "${svc.name}"? Esta accion no se puede deshacer.`)) return;
    try {
      await deleteService(svc.id);
      loadServices();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar el servicio");
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
            {services.length} servicio{services.length !== 1 ? "s" : ""} registrado{services.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          + Nuevo Servicio
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar servicio por nombre..."
          className="w-full max-w-sm px-4 py-2 border border-border rounded-lg text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Categoria</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Precio</th>
              <th className="text-center px-6 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  {search
                    ? "No se encontraron servicios con ese nombre"
                    : "No hay servicios registrados. Crea el primero."}
                </td>
              </tr>
            ) : (
              services.map((svc) => (
                <tr
                  key={svc.id}
                  className="border-b border-border last:border-0 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium">{svc.name}</p>
                    {svc.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {svc.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {svc.category ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    {formatCurrency(svc.price)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        svc.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {svc.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(svc)}
                      className="text-primary hover:underline mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(svc)}
                      className="text-danger hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <ServiceModal
          initial={editingService}
          onClose={() => setShowModal(false)}
          onSaved={loadServices}
        />
      )}
    </div>
  );
}
