"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { usePagination } from "@/hooks/usePagination";
import { useRole } from "@/hooks/useRole";
import { SearchInput } from "@/components/SearchInput";
import { PaginationBar } from "@/components/PaginationBar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { PaginatedResponse } from "@/types/pagination";
import {
  getInventoryStats,
  getLowStockProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addMovement,
  type Product,
  type InventoryStats,
  type ProductCategory,
  type MovementType,
  type CreateProductDto,
  type CreateMovementDto,
} from "@/services/inventory";

// ─── Helpers y constantes ─────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  MEDICINE: "Medicamento",
  VACCINE: "Vacuna",
  FOOD: "Alimento",
  ACCESSORY: "Accesorio",
  CONSUMABLE: "Consumible",
  EQUIPMENT: "Equipo",
  OTHER: "Otro",
};

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  MEDICINE: "bg-blue-100 text-blue-700",
  VACCINE: "bg-green-100 text-green-700",
  FOOD: "bg-orange-100 text-orange-700",
  ACCESSORY: "bg-purple-100 text-purple-700",
  CONSUMABLE: "bg-yellow-100 text-yellow-700",
  EQUIPMENT: "bg-gray-200 text-gray-700",
  OTHER: "bg-gray-100 text-gray-500",
};

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  IN: "Entrada",
  OUT: "Salida",
  ADJUSTMENT: "Ajuste",
};

const ALL_CATEGORIES: ProductCategory[] = [
  "MEDICINE",
  "VACCINE",
  "FOOD",
  "ACCESSORY",
  "CONSUMABLE",
  "EQUIPMENT",
  "OTHER",
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-t border-gray-100">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function StatCard({
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
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1 ${color ?? ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Modal de producto (crear/editar) ─────────────────────────────────────────

function ProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = product !== null;

  const [form, setForm] = useState<CreateProductDto>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "MEDICINE",
    unit: product?.unit ?? "unidad",
    costPrice: product?.costPrice ?? 0,
    salePrice: product?.salePrice ?? 0,
    stock: product?.stock ?? 0,
    minStock: product?.minStock ?? 5,
    maxStock: product?.maxStock ?? undefined,
    sku: product?.sku ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? undefined
            : parseFloat(value)
          : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload: CreateProductDto = {
      ...form,
      description: form.description || undefined,
      sku: form.sku || undefined,
      maxStock: form.maxStock ?? undefined,
    };

    try {
      setSaving(true);
      if (isEdit) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al guardar el producto";
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? msg
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Editar Producto" : "Nuevo Producto"}
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

          {/* Nombre y SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                SKU{" "}
                <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <input
                name="sku"
                type="text"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.sku ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Descripcion */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Descripcion{" "}
              <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <textarea
              name="description"
              rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg text-sm resize-none"
              value={form.description ?? ""}
              onChange={handleChange}
            />
          </div>

          {/* Categoria y Unidad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                required
                className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-white"
                value={form.category}
                onChange={handleChange}
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Unidad <span className="text-red-500">*</span>
              </label>
              <input
                name="unit"
                type="text"
                required
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.unit}
                onChange={handleChange}
                placeholder="ej: unidad, ml, kg"
              />
            </div>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Precio de Costo <span className="text-red-500">*</span>
              </label>
              <input
                name="costPrice"
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.costPrice}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Precio de Venta <span className="text-red-500">*</span>
              </label>
              <input
                name="salePrice"
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.salePrice}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Stock Inicial
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.stock ?? 0}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Stock Minimo
              </label>
              <input
                name="minStock"
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.minStock ?? 5}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Stock Maximo{" "}
                <span className="text-muted-foreground text-xs">(opc.)</span>
              </label>
              <input
                name="maxStock"
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={form.maxStock ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : isEdit
                ? "Guardar Cambios"
                : "Crear Producto"}
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

// ─── Modal de movimiento de stock ─────────────────────────────────────────────

function MovementModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<MovementType>("IN");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const qty = parseFloat(quantity) || 0;

  // Calcula el stock resultante en tiempo real para preview
  function computeResultingStock(): number {
    switch (type) {
      case "IN":
        return product.stock + qty;
      case "OUT":
        return product.stock - qty;
      case "ADJUSTMENT":
        return qty;
    }
  }

  const resultingStock = computeResultingStock();
  const wouldGoNegative = type === "OUT" && resultingStock < 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (qty <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    if (wouldGoNegative) {
      setError(
        `Stock insuficiente. Stock actual: ${product.stock}, solicitado: ${qty}`
      );
      return;
    }

    const payload: CreateMovementDto = {
      productId: product.id,
      type,
      quantity: qty,
      reason: reason.trim() || undefined,
    };

    try {
      setSaving(true);
      await addMovement(payload);
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al registrar movimiento";
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? msg
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Movimiento de Stock</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{product.name}</p>
          </div>
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

          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo de movimiento <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["IN", "OUT", "ADJUSTMENT"] as MovementType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                    type === t
                      ? t === "IN"
                        ? "bg-green-600 text-white border-green-600"
                        : t === "OUT"
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-blue-600 text-white border-blue-600"
                      : "border-border text-muted-foreground hover:bg-gray-50"
                  }`}
                >
                  {t === "IN" ? "+ Entrada" : t === "OUT" ? "- Salida" : "Ajuste"}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {type === "ADJUSTMENT" ? "Nuevo stock total" : "Cantidad"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              className="w-full px-4 py-2 border border-border rounded-lg text-sm"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Preview de stock en tiempo real */}
          {qty > 0 && (
            <div
              className={`rounded-lg p-4 text-sm ${
                wouldGoNegative
                  ? "bg-red-50 border border-red-200"
                  : "bg-gray-50 border border-border"
              }`}
            >
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock actual</span>
                <span className="font-medium">
                  {product.stock} {product.unit}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">
                  {type === "IN"
                    ? "Entrada"
                    : type === "OUT"
                    ? "Salida"
                    : "Ajuste a"}
                </span>
                <span
                  className={
                    type === "IN"
                      ? "text-green-600 font-medium"
                      : type === "OUT"
                      ? "text-red-600 font-medium"
                      : "text-blue-600 font-medium"
                  }
                >
                  {type === "IN" ? "+" : type === "OUT" ? "-" : "="}
                  {qty} {product.unit}
                </span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-border">
                <span className="font-medium">Stock resultante</span>
                <span
                  className={`font-bold ${
                    wouldGoNegative
                      ? "text-red-600"
                      : resultingStock <= product.minStock
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {resultingStock.toFixed(2)} {product.unit}
                </span>
              </div>
              {!wouldGoNegative && resultingStock <= product.minStock && (
                <p className="text-orange-600 text-xs mt-2">
                  El stock quedara por debajo del minimo ({product.minStock} {product.unit})
                </p>
              )}
            </div>
          )}

          {/* Motivo (opcional) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Motivo{" "}
              <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-border rounded-lg text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ej: Compra proveedor, Venta consulta, Inventario"
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving || wouldGoNegative || qty <= 0}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Registrando..." : "Registrar Movimiento"}
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

// ─── Pagina principal ─────────────────────────────────────────────────────────

export default function InventoryPage() {
  const { role } = useRole();
  const isAdmin = role === "ADMIN";

  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);

  // Filtros
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "">("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movementProduct, setMovementProduct] = useState<Product | null>(null);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [productToDeactivate, setProductToDeactivate] = useState<Product | null>(null);

  // Stats y low-stock: fetched independientemente
  const loadSideData = useCallback(async () => {
    try {
      const [inventoryStats, lowStock] = await Promise.all([
        getInventoryStats(),
        getLowStockProducts(),
      ]);
      setStats(inventoryStats);
      setLowStockItems(lowStock);
    } catch {
      // Continuar sin estadísticas
    }
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadSideData();
  }, [loadSideData]);

  // Paginación de productos
  const fetchInventory = useCallback(
    async (pg: number, lim: number, srch: string, signal: AbortSignal) => {
      const params = new URLSearchParams({
        page: String(pg),
        limit: String(lim),
        ...(srch ? { search: srch } : {}),
        ...(categoryFilter ? { category: categoryFilter } : {}),
        ...(onlyLowStock ? { lowStock: "true" } : {}),
      });
      const res = await api.get<PaginatedResponse<Product>>(
        `/inventory/products?${params}`,
        { signal }
      );
      return res.data;
    },
    [categoryFilter, onlyLowStock, refreshKey]
  );

  const {
    data: products,
    total,
    page,
    totalPages,
    search,
    loading,
    setSearch,
    setPage,
  } = usePagination<Product>({ fetchFn: fetchInventory });

  function triggerRefresh() {
    setRefreshKey((k) => k + 1);
  }

  async function handleDelete(product: Product) {
    setProductToDeactivate(product);
    setDeactivateConfirmOpen(true);
  }

  async function doDeactivate() {
    if (!productToDeactivate) return;
    setDeactivateConfirmOpen(false);
    try {
      await deleteProduct(productToDeactivate.id);
      setProductToDeactivate(null);
      triggerRefresh();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Error al eliminar";
      alert(msg);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats?.totalProducts ?? 0} productos activos
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            + Nuevo Producto
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total productos"
          value={stats?.totalProducts ?? "—"}
          sub={`${stats?.activeCategories ?? 0} categorias`}
        />
        <StatCard
          label="Stock bajo"
          value={stats?.lowStockProducts ?? "—"}
          sub="requieren reabastecimiento"
          color={
            (stats?.lowStockProducts ?? 0) > 0 ? "text-red-600" : "text-green-600"
          }
        />
        <StatCard
          label="Valor del inventario"
          value={stats ? formatCurrency(stats.totalValue) : "—"}
          sub="basado en precio de costo"
          color="text-green-700"
        />
        <StatCard
          label="Categorias activas"
          value={stats?.activeCategories ?? "—"}
          sub="con productos registrados"
        />
      </div>

      {/* Banner de alerta de stock bajo */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
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
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">
                {lowStockItems.length} producto
                {lowStockItems.length !== 1 ? "s" : ""} con stock bajo
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lowStockItems.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-yellow-600">
                      ({p.stock}/{p.minStock} {p.unit})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre..."
          disabled={loading}
        />
        <select
          className="px-4 py-2 border border-border rounded-lg text-sm bg-white"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value as ProductCategory | "");
            setPage(1);
          }}
        >
          <option value="">Todas las categorias</option>
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        <button
          onClick={() => { setOnlyLowStock((v) => !v); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
            onlyLowStock
              ? "bg-orange-100 text-orange-700 border-orange-300"
              : "border-border text-muted-foreground hover:bg-gray-50"
          }`}
        >
          Solo stock bajo
        </button>
      </div>

      {/* Mobile: cards */}
      {loading && products.length === 0 ? (
        <div className="md:hidden space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="md:hidden text-center py-12 text-muted-foreground">
          {search || categoryFilter || onlyLowStock
            ? "No se encontraron productos con ese criterio."
            : "No hay productos registrados."}
        </div>
      ) : (
        <div className="md:hidden space-y-3">
          {products.map((product) => {
            const isLow = product.stock <= product.minStock;
            return (
              <div key={product.id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-base leading-snug">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{product.description}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 mt-0.5 ${CATEGORY_COLORS[product.category]}`}>
                    {CATEGORY_LABELS[product.category]}
                  </span>
                </div>
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                    <span className="text-gray-400 font-medium">Stock</span>
                    <span className={`font-semibold ${isLow ? "text-red-600" : "text-gray-900"}`}>
                      {product.stock} {product.unit}
                      {isLow && <span className="text-xs font-normal ml-1 text-red-500">(min: {product.minStock})</span>}
                    </span>
                    <span className="text-gray-400 font-medium">Precio</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(product.salePrice)}</span>
                    {product.sku && (
                      <>
                        <span className="text-gray-400 font-medium">SKU</span>
                        <span className="text-gray-700 font-mono text-xs">{product.sku}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t border-border flex gap-2">
                  <button
                    onClick={() => setMovementProduct(product)}
                    className="flex-1 inline-flex items-center justify-center text-sm px-2 py-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors"
                  >
                    Movimiento
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="flex-1 inline-flex items-center justify-center text-sm px-2 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                    >
                      Editar
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex-1 inline-flex items-center justify-center text-sm px-2 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors"
                    >
                      Desactivar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop: tabla */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio Venta</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  {search || categoryFilter || onlyLowStock
                    ? "No se encontraron productos con ese criterio."
                    : "No hay productos registrados."}
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isLow = product.stock <= product.minStock;
                return (
                  <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{product.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[product.category]}`}>
                        {CATEGORY_LABELS[product.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{product.sku ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${isLow ? "text-red-600" : "text-foreground"}`}>{product.stock}</span>
                      <span className="text-muted-foreground text-xs ml-1">{product.unit}</span>
                      {isLow && <span className="ml-2 text-xs text-red-500">(min: {product.minStock})</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(product.salePrice)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setMovementProduct(product)}
                          title="Registrar movimiento de stock"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                          Movimiento
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(product)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        loading={loading}
      />

      {/* Modal crear — solo ADMIN */}
      {isAdmin && showCreateModal && (
        <ProductModal
          product={null}
          onClose={() => setShowCreateModal(false)}
          onSaved={triggerRefresh}
        />
      )}

      {/* Modal editar — solo ADMIN */}
      {isAdmin && editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={triggerRefresh}
        />
      )}

      {/* Modal movimiento de stock */}
      {movementProduct && (
        <MovementModal
          product={movementProduct}
          onClose={() => setMovementProduct(null)}
          onSaved={triggerRefresh}
        />
      )}
      <ConfirmDialog
        open={deactivateConfirmOpen}
        title={`¿Desactivar el producto "${productToDeactivate?.name}"?`}
        variant="danger"
        onConfirm={doDeactivate}
        onClose={() => { setDeactivateConfirmOpen(false); setProductToDeactivate(null); }}
      />
    </div>
  );
}
