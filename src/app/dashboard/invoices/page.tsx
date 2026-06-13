"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/services/api";
import {
  getInvoiceStats,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  type Invoice,
  type InvoiceStats,
  type InvoiceStatus,
  type CreateInvoiceItemDto,
} from "@/services/invoices";
import { searchCatalog, type CatalogItem } from "@/services/catalog";
import { usePagination } from "@/hooks/usePagination";
import { SearchInput } from "@/components/SearchInput";
import { PaginationBar } from "@/components/PaginationBar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { PaginatedResponse } from "@/types/pagination";

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface ClientOption {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface PetOption {
  id: string;
  name: string;
  species: string;
  clientId: string;
}

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Borrador",
  ISSUED: "Emitida",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
};

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ISSUED: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

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
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color ?? ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Autocomplete de descripción de ítem (catálogo + inventario) ──────────────

/**
 * Input con debounce de 300ms que busca en el catálogo de servicios e inventario.
 * Al seleccionar un resultado autocompleta descripción y precio unitario.
 * El usuario siempre puede escribir manualmente sin seleccionar del catálogo.
 */
function ItemDescriptionInput({
  value,
  onChange,
  onSelectCatalogItem,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelectCatalogItem: (item: CatalogItem) => void;
}) {
  const [suggestions, setSuggestions] = useState<CatalogItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);

    // Cancelar debounce anterior
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Debounce 300ms para no spamear el backend
    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await searchCatalog(val.trim());
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(item: CatalogItem) {
    onSelectCatalogItem(item);
    setSuggestions([]);
    setShowDropdown(false);
  }

  function handleBlur() {
    // Retrasamos el cierre para que el click en un item tenga tiempo de dispararse
    setTimeout(() => setShowDropdown(false), 150);
  }

  // Servicios primero, luego productos
  const serviceItems = suggestions.filter((s) => s.type === "service");
  const productItems = suggestions.filter((s) => s.type === "product");

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Descripcion o buscar servicio..."
        className="w-full text-sm outline-none"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        required
      />

      {showDropdown && (
        <div className="absolute z-20 left-0 top-full mt-1 w-72 bg-white border border-border rounded-lg shadow-xl text-sm overflow-hidden">
          {loading && (
            <div className="px-3 py-2 text-muted-foreground text-xs">Buscando...</div>
          )}

          {!loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-muted-foreground text-xs">Sin coincidencias</div>
          )}

          {!loading && serviceItems.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-gray-50 border-b border-border">
                Servicios
              </div>
              {serviceItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between gap-2"
                  onMouseDown={() => handleSelect(item)}
                >
                  <div className="min-w-0">
                    <span className="font-medium truncate block">{item.name}</span>
                    {item.category && (
                      <span className="text-xs text-muted-foreground">{item.category}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                      Servicio
                    </span>
                    <span className="font-semibold text-xs">
                      ${item.price.toLocaleString("es-CO")}
                    </span>
                  </div>
                </button>
              ))}
            </>
          )}

          {!loading && productItems.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-gray-50 border-b border-border">
                Productos
              </div>
              {productItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-green-50 flex items-center justify-between gap-2"
                  onMouseDown={() => handleSelect(item)}
                >
                  <div className="min-w-0">
                    <span className="font-medium truncate block">{item.name}</span>
                    {item.stock !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        Stock: {item.stock} {item.unit ?? ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                      Producto
                    </span>
                    <span className="font-semibold text-xs">
                      ${item.price.toLocaleString("es-CO")}
                    </span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Modal de creación ────────────────────────────────────────────────────────

function CreateInvoiceModal({
  clients,
  pets,
  onClose,
  onCreated,
}: {
  clients: ClientOption[];
  pets: PetOption[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: "1", unitPrice: "" },
  ]);
  const [tax, setTax] = useState("0");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const clientPets = pets.filter((p) => p.clientId === selectedClient?.id);

  // Calcula totales en tiempo real
  const subtotal = items.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return acc + qty * price;
  }, 0);
  const taxPct = parseFloat(tax) || 0;
  const taxAmount = subtotal * (taxPct / 100);
  const total = subtotal + taxAmount;

  function addItem() {
    setItems([...items, { description: "", quantity: "1", unitPrice: "" }]);
  }

  function removeItem(index: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  /**
   * Cuando el usuario selecciona un ítem del catálogo/inventario,
   * autocompletamos descripción y precio unitario de esa fila.
   */
  function handleCatalogSelect(idx: number, catalogItem: CatalogItem) {
    const updated = [...items];
    updated[idx] = {
      ...updated[idx],
      description: catalogItem.name,
      unitPrice: String(catalogItem.price),
    };
    setItems(updated);
  }

  function selectClient(client: ClientOption) {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientDropdown(false);
    setSelectedPetId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedClient) {
      setError("Selecciona un cliente");
      return;
    }

    const parsedItems: CreateInvoiceItemDto[] = items.map((item) => ({
      description: item.description.trim(),
      quantity: parseFloat(item.quantity) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
    }));

    const invalidItem = parsedItems.find(
      (i) => !i.description || i.quantity <= 0 || i.unitPrice < 0
    );
    if (invalidItem) {
      setError("Revisa los items: descripcion, cantidad y precio son requeridos");
      return;
    }

    try {
      setSaving(true);
      await createInvoice({
        clientId: selectedClient.id,
        petId: selectedPetId || undefined,
        items: parsedItems,
        tax: taxPct,
        notes: notes.trim() || undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Error al crear la factura");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Nueva Factura</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Selector de cliente con autocomplete */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar cliente por nombre..."
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowClientDropdown(true);
                  if (
                    selectedClient &&
                    e.target.value !== selectedClient.name
                  ) {
                    setSelectedClient(null);
                    setSelectedPetId("");
                  }
                }}
                onFocus={() => setShowClientDropdown(true)}
                autoComplete="off"
              />
              {showClientDropdown && filteredClients.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {filteredClients.map((c) => (
                    <li
                      key={c.id}
                      className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onMouseDown={() => selectClient(c)}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground ml-2">{c.phone}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Selector de mascota (opcional, filtra por cliente) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mascota <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <select
              className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-white"
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              disabled={!selectedClient}
            >
              <option value="">Sin mascota</option>
              {clientPets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species})
                </option>
              ))}
            </select>
            {selectedClient && clientPets.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">Este cliente no tiene mascotas registradas</p>
            )}
          </div>

          {/* Items de factura con autocomplete del catálogo */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Conceptos <span className="text-red-500">*</span>
            </label>
            <div className="border border-border rounded-lg overflow-visible">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Descripcion</th>
                    <th className="text-center px-3 py-2 font-medium text-muted-foreground w-20">Cant.</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground w-28">P. Unit.</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground w-24">Total</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const lineTotal =
                      (parseFloat(item.quantity) || 0) *
                      (parseFloat(item.unitPrice) || 0);
                    return (
                      <tr key={idx} className="border-b border-border last:border-0">
                        {/* Campo descripcion con autocomplete del catalogo */}
                        <td className="px-3 py-2 relative">
                          <ItemDescriptionInput
                            value={item.description}
                            onChange={(v) => updateItem(idx, "description", v)}
                            onSelectCatalogItem={(catalogItem) =>
                              handleCatalogSelect(idx, catalogItem)
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            className="w-full text-sm text-center outline-none"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(idx, "quantity", e.target.value)
                            }
                            required
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full text-sm text-right outline-none"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(idx, "unitPrice", e.target.value)
                            }
                            required
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground">
                          {formatCurrency(lineTotal)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            disabled={items.length === 1}
                            className="text-muted-foreground hover:text-danger disabled:opacity-30 text-lg leading-none"
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-2 text-sm text-primary hover:underline"
            >
              + Agregar item
            </button>
          </div>

          {/* Impuesto y vencimiento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Impuesto %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Vencimiento <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Notas <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Observaciones o indicaciones..."
              className="w-full px-4 py-2 border border-border rounded-lg text-sm resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Resumen de totales */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Impuesto ({taxPct}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-border pt-2">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Creando..." : "Crear Factura"}
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

// ─── Modal de detalle ─────────────────────────────────────────────────────────

function InvoiceDetailModal({
  invoice,
  onClose,
  onUpdated,
}: {
  invoice: Invoice;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ invoiceId: string; newStatus: string } | null>(null);
  const [deleteInvoiceConfirmOpen, setDeleteInvoiceConfirmOpen] = useState(false);

  const statusLabels: Record<string, string> = {
    ISSUED: "¿Emitir esta factura?",
    PAID: "¿Marcar como pagada?",
    CANCELLED: "¿Cancelar esta factura?",
  };

  async function handleStatusChange(newStatus: InvoiceStatus) {
    setPendingStatusChange({ invoiceId: invoice.id, newStatus });
    setStatusConfirmOpen(true);
  }

  async function doStatusChange() {
    if (!pendingStatusChange) return;
    setStatusConfirmOpen(false);
    try {
      setLoading(true);
      setError("");
      await updateInvoice(pendingStatusChange.invoiceId, { status: pendingStatusChange.newStatus as InvoiceStatus });
      setPendingStatusChange(null);
      onUpdated();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteInvoiceConfirmOpen(true);
  }

  async function doDeleteInvoice() {
    setDeleteInvoiceConfirmOpen(false);
    try {
      setLoading(true);
      await deleteInvoice(invoice.id);
      onUpdated();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Error al eliminar");
    } finally {
      setLoading(false);
    }
  }

  const taxAmount = invoice.subtotal * (invoice.tax / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Factura</p>
            <h2 className="text-xl font-bold">{invoice.number}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[invoice.status]}`}
            >
              {STATUS_LABELS[invoice.status]}
            </span>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xl leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Datos del cliente y mascota */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase mb-2">Cliente</p>
              <p className="font-semibold">{invoice.client.name}</p>
              <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
              <p className="text-sm text-muted-foreground">{invoice.client.phone}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase mb-2">Mascota</p>
              {invoice.pet ? (
                <>
                  <p className="font-semibold">{invoice.pet.name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.pet.species}</p>
                  {invoice.pet.breed && (
                    <p className="text-sm text-muted-foreground">{invoice.pet.breed}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No especificada</p>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium text-xs uppercase">Emision</p>
              <p>{formatDate(invoice.issuedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium text-xs uppercase">Vencimiento</p>
              <p>{formatDate(invoice.dueAt)}</p>
            </div>
            {invoice.paidAt && (
              <div>
                <p className="text-muted-foreground font-medium text-xs uppercase">Fecha de pago</p>
                <p className="text-green-700">{formatDate(invoice.paidAt)}</p>
              </div>
            )}
          </div>

          {/* Tabla de items */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Descripcion</th>
                  <th className="text-center px-4 py-2 font-medium text-muted-foreground">Cant.</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">P. Unit.</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2 ml-auto max-w-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Impuesto ({invoice.tax}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-border pt-2">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>

          {/* Notas */}
          {invoice.notes && (
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Notas</p>
              <p className="text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* Acciones por estado */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {invoice.status === "DRAFT" && (
              <>
                <button
                  onClick={() => handleStatusChange("ISSUED")}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  Emitir
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </>
            )}
            {invoice.status === "ISSUED" && (
              <>
                <button
                  onClick={() => handleStatusChange("PAID")}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Marcar como Pagada
                </button>
                <button
                  onClick={() => handleStatusChange("CANCELLED")}
                  disabled={loading}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </>
            )}
            {(invoice.status === "PAID" || invoice.status === "CANCELLED") && (
              <p className="text-sm text-muted-foreground italic">Esta factura es de solo lectura.</p>
            )}
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={statusConfirmOpen}
        title={pendingStatusChange ? statusLabels[pendingStatusChange.newStatus] ?? "¿Confirmar cambio de estado?" : ""}
        variant="default"
        loading={loading}
        onConfirm={doStatusChange}
        onClose={() => { setStatusConfirmOpen(false); setPendingStatusChange(null); }}
      />
      <ConfirmDialog
        open={deleteInvoiceConfirmOpen}
        title="¿Eliminar esta factura?"
        description="Esta acción no se puede deshacer."
        variant="danger"
        loading={loading}
        onConfirm={doDeleteInvoice}
        onClose={() => setDeleteInvoiceConfirmOpen(false)}
      />
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [pets, setPets] = useState<PetOption[]>([]);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [quickPayConfirmOpen, setQuickPayConfirmOpen] = useState(false);
  const [invoiceForQuickPay, setInvoiceForQuickPay] = useState<Invoice | null>(null);
  const [quickDeleteConfirmOpen, setQuickDeleteConfirmOpen] = useState(false);
  const [invoiceForQuickDelete, setInvoiceForQuickDelete] = useState<Invoice | null>(null);

  const fetchInvoices = useCallback(
    async (pg: number, lim: number, srch: string, signal: AbortSignal) => {
      const params = new URLSearchParams({
        page: String(pg),
        limit: String(lim),
        ...(srch ? { search: srch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const res = await api.get<PaginatedResponse<Invoice>>(`/invoices?${params}`, { signal });
      return res.data;
    },
    [statusFilter, refreshKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const {
    data: invoices,
    total,
    page,
    totalPages,
    search,
    loading,
    setSearch,
    setPage,
  } = usePagination<Invoice>({ fetchFn: fetchInvoices });

  // Carga stats y catálogos al montar
  useEffect(() => {
    getInvoiceStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, [refreshKey]);

  useEffect(() => {
    async function loadCatalogues() {
      const [clientsRes, petsRes] = await Promise.all([
        api.get<ClientOption[]>("/clients"),
        api.get<PetOption[]>("/pets"),
      ]);
      setClients(clientsRes.data);
      setPets(petsRes.data);
    }
    loadCatalogues();
  }, []);

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  async function handleMarkPaid(invoice: Invoice) {
    setInvoiceForQuickPay(invoice);
    setQuickPayConfirmOpen(true);
  }

  async function doMarkPaid() {
    if (!invoiceForQuickPay) return;
    setQuickPayConfirmOpen(false);
    try {
      await updateInvoice(invoiceForQuickPay.id, { status: "PAID" });
      setInvoiceForQuickPay(null);
      handleRefresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Error al actualizar");
    }
  }

  async function handleDelete(invoice: Invoice) {
    setInvoiceForQuickDelete(invoice);
    setQuickDeleteConfirmOpen(true);
  }

  async function doQuickDelete() {
    if (!invoiceForQuickDelete) return;
    setQuickDeleteConfirmOpen(false);
    try {
      await deleteInvoice(invoiceForQuickDelete.id);
      setInvoiceForQuickDelete(null);
      handleRefresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Error al eliminar");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Facturacion</h1>
          <p className="text-muted-foreground text-sm mt-1">{stats?.total ?? 0} facturas en total</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          + Nueva Factura
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total facturas"
          value={stats?.total ?? "—"}
          sub={`${stats?.draft ?? 0} borradores`}
        />
        <StatCard
          label="Pendientes"
          value={stats?.issued ?? "—"}
          sub="emitidas sin cobrar"
          color="text-blue-600"
        />
        <StatCard
          label="Pagadas"
          value={stats?.paid ?? "—"}
          sub="este periodo"
          color="text-green-600"
        />
        <StatCard
          label="Ingresos totales"
          value={stats ? formatCurrency(stats.totalRevenue) : "—"}
          sub="solo facturas pagadas"
          color="text-green-700"
        />
      </div>

      {/* Filtros + búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por número o cliente..."
        />
        <select
          className="px-4 py-2 border border-border rounded-lg text-sm bg-white"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as InvoiceStatus | "");
            setPage(1);
          }}
        >
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borradores</option>
          <option value="ISSUED">Emitidas</option>
          <option value="PAID">Pagadas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      {/* Mobile: cards */}
      {loading && invoices.length === 0 ? (
        <div className="md:hidden space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : invoices.length === 0 ? (
        <div className="md:hidden text-center py-12 text-muted-foreground">
          {search || statusFilter
            ? "No se encontraron facturas con ese filtro"
            : "No hay facturas registradas"}
        </div>
      ) : (
        <div className="md:hidden space-y-3">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono font-bold text-primary text-base leading-snug">{inv.number}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{inv.client.name}</p>
                  {inv.pet && <p className="text-xs text-gray-400 mt-0.5">{inv.pet.name}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 text-base">{formatCurrency(inv.total)}</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_COLORS[inv.status]}`}>
                    {STATUS_LABELS[inv.status]}
                  </span>
                </div>
              </div>
              <div className="px-4 pb-3">
                <p className="text-xs text-gray-400">{formatDate(inv.issuedAt)}</p>
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-border flex gap-2">
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="flex-1 inline-flex items-center justify-center text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Ver detalle
                </button>
                {inv.status === "ISSUED" && (
                  <button
                    onClick={() => handleMarkPaid(inv)}
                    className="flex-1 inline-flex items-center justify-center text-sm px-3 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 font-medium transition-colors"
                  >
                    Marcar pagada
                  </button>
                )}
                {inv.status === "DRAFT" && (
                  <button
                    onClick={() => handleDelete(inv)}
                    className="flex-1 inline-flex items-center justify-center text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                )}
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Numero</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mascota</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && invoices.length === 0 ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  {search || statusFilter
                    ? "No se encontraron facturas con ese filtro"
                    : "No hay facturas registradas"}
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{inv.number}</td>
                  <td className="px-4 py-3 font-medium">{inv.client.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{inv.pet ? inv.pet.name : "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status]}`}>
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.issuedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                      </button>
                      {inv.status === "ISSUED" && (
                        <button
                          onClick={() => handleMarkPaid(inv)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-green-200 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Pagar
                        </button>
                      )}
                      {inv.status === "DRAFT" && (
                        <button
                          onClick={() => handleDelete(inv)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      )}
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

      {/* Modales */}
      {showCreateModal && (
        <CreateInvoiceModal
          clients={clients}
          pets={pets}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleRefresh}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onUpdated={handleRefresh}
        />
      )}
      <ConfirmDialog
        open={quickPayConfirmOpen}
        title={`¿Marcar ${invoiceForQuickPay?.number} como pagada?`}
        variant="default"
        onConfirm={doMarkPaid}
        onClose={() => { setQuickPayConfirmOpen(false); setInvoiceForQuickPay(null); }}
      />
      <ConfirmDialog
        open={quickDeleteConfirmOpen}
        title={`¿Eliminar la factura ${invoiceForQuickDelete?.number}?`}
        description="Esta acción no se puede deshacer."
        variant="danger"
        onConfirm={doQuickDelete}
        onClose={() => { setQuickDeleteConfirmOpen(false); setInvoiceForQuickDelete(null); }}
      />
    </div>
  );
}
