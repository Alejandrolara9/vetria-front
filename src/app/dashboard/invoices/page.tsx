"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/services/api";
import {
  getInvoices,
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
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
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
    <tr className="border-b border-border">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-6 py-4">
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
      <p className="text-xs text-muted font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color ?? ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
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
            <div className="px-3 py-2 text-muted text-xs">Buscando...</div>
          )}

          {!loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-muted text-xs">Sin coincidencias</div>
          )}

          {!loading && serviceItems.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wide bg-gray-50 border-b border-border">
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
                      <span className="text-xs text-muted">{item.category}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                      Servicio
                    </span>
                    <span className="font-semibold text-xs">
                      ${item.price.toLocaleString("es-MX")}
                    </span>
                  </div>
                </button>
              ))}
            </>
          )}

          {!loading && productItems.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wide bg-gray-50 border-b border-border">
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
                      <span className="text-xs text-muted">
                        Stock: {item.stock} {item.unit ?? ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                      Producto
                    </span>
                    <span className="font-semibold text-xs">
                      ${item.price.toLocaleString("es-MX")}
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear la factura");
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
            className="text-muted hover:text-foreground text-xl leading-none"
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
                      <span className="text-muted ml-2">{c.phone}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Selector de mascota (opcional, filtra por cliente) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mascota <span className="text-muted text-xs">(opcional)</span>
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
              <p className="text-xs text-muted mt-1">Este cliente no tiene mascotas registradas</p>
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
                    <th className="text-left px-3 py-2 font-medium text-muted">Descripcion</th>
                    <th className="text-center px-3 py-2 font-medium text-muted w-20">Cant.</th>
                    <th className="text-right px-3 py-2 font-medium text-muted w-28">P. Unit.</th>
                    <th className="text-right px-3 py-2 font-medium text-muted w-24">Total</th>
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
                        <td className="px-3 py-2 text-right text-muted">
                          {formatCurrency(lineTotal)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            disabled={items.length === 1}
                            className="text-muted hover:text-danger disabled:opacity-30 text-lg leading-none"
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
                Vencimiento <span className="text-muted text-xs">(opcional)</span>
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
              Notas <span className="text-muted text-xs">(opcional)</span>
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
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
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
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-sm font-medium disabled:opacity-50"
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

  async function handleStatusChange(newStatus: InvoiceStatus) {
    const labels: Record<string, string> = {
      ISSUED: "Emitir esta factura?",
      PAID: "Marcar como pagada?",
      CANCELLED: "Cancelar esta factura? Esta accion no se puede deshacer.",
    };
    if (!confirm(labels[newStatus])) return;

    try {
      setLoading(true);
      setError("");
      await updateInvoice(invoice.id, { status: newStatus });
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Eliminar esta factura? Esta accion no se puede deshacer.")) return;
    try {
      setLoading(true);
      await deleteInvoice(invoice.id);
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar");
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
            <p className="text-xs text-muted uppercase tracking-wide font-medium">Factura</p>
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
              className="text-muted hover:text-foreground text-xl leading-none"
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
              <p className="text-xs text-muted font-medium uppercase mb-2">Cliente</p>
              <p className="font-semibold">{invoice.client.name}</p>
              <p className="text-sm text-muted">{invoice.client.email}</p>
              <p className="text-sm text-muted">{invoice.client.phone}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-muted font-medium uppercase mb-2">Mascota</p>
              {invoice.pet ? (
                <>
                  <p className="font-semibold">{invoice.pet.name}</p>
                  <p className="text-sm text-muted">{invoice.pet.species}</p>
                  {invoice.pet.breed && (
                    <p className="text-sm text-muted">{invoice.pet.breed}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">No especificada</p>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted font-medium text-xs uppercase">Emision</p>
              <p>{formatDate(invoice.issuedAt)}</p>
            </div>
            <div>
              <p className="text-muted font-medium text-xs uppercase">Vencimiento</p>
              <p>{formatDate(invoice.dueAt)}</p>
            </div>
            {invoice.paidAt && (
              <div>
                <p className="text-muted font-medium text-xs uppercase">Fecha de pago</p>
                <p className="text-green-700">{formatDate(invoice.paidAt)}</p>
              </div>
            )}
          </div>

          {/* Tabla de items */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-muted">Descripcion</th>
                  <th className="text-center px-4 py-2 font-medium text-muted">Cant.</th>
                  <th className="text-right px-4 py-2 font-medium text-muted">P. Unit.</th>
                  <th className="text-right px-4 py-2 font-medium text-muted">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-center text-muted">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-muted">
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
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
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
              <p className="text-xs text-muted font-medium uppercase mb-1">Notas</p>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
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
              <p className="text-sm text-muted italic">Esta factura es de solo lectura.</p>
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
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [pets, setPets] = useState<PetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [invoiceList, invoiceStats] = await Promise.all([
        getInvoices(statusFilter ? { status: statusFilter } : undefined),
        getInvoiceStats(),
      ]);
      setInvoices(invoiceList);
      setStats(invoiceStats);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Carga clientes y mascotas al montar (para el modal de creación)
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleMarkPaid(invoice: Invoice) {
    if (!confirm(`Marcar ${invoice.number} como pagada?`)) return;
    try {
      await updateInvoice(invoice.id, { status: "PAID" });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al actualizar");
    }
  }

  async function handleDelete(invoice: Invoice) {
    if (!confirm(`Eliminar la factura ${invoice.number}? Esta accion no se puede deshacer.`)) return;
    try {
      await deleteInvoice(invoice.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Facturacion</h1>
          <p className="text-muted text-sm mt-1">{stats?.total ?? 0} facturas en total</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
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

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <select
          className="px-4 py-2 border border-border rounded-lg text-sm bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | "")}
        >
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borradores</option>
          <option value="ISSUED">Emitidas</option>
          <option value="PAID">Pagadas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-muted">Numero</th>
              <th className="text-left px-6 py-3 font-medium text-muted">Cliente</th>
              <th className="text-left px-6 py-3 font-medium text-muted">Mascota</th>
              <th className="text-right px-6 py-3 font-medium text-muted">Total</th>
              <th className="text-center px-6 py-3 font-medium text-muted">Estado</th>
              <th className="text-left px-6 py-3 font-medium text-muted">Fecha</th>
              <th className="text-right px-6 py-3 font-medium text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted">
                  No se encontraron facturas
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border last:border-0 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-mono font-semibold text-primary">
                    {inv.number}
                  </td>
                  <td className="px-6 py-4 font-medium">{inv.client.name}</td>
                  <td className="px-6 py-4 text-muted">
                    {inv.pet ? inv.pet.name : "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status]}`}
                    >
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {formatDate(inv.issuedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="text-primary hover:underline mr-3"
                    >
                      Ver
                    </button>
                    {inv.status === "ISSUED" && (
                      <button
                        onClick={() => handleMarkPaid(inv)}
                        className="text-green-600 hover:underline mr-3"
                      >
                        Pagar
                      </button>
                    )}
                    {inv.status === "DRAFT" && (
                      <button
                        onClick={() => handleDelete(inv)}
                        className="text-danger hover:underline"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateInvoiceModal
          clients={clients}
          pets={pets}
          onClose={() => setShowCreateModal(false)}
          onCreated={loadData}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onUpdated={loadData}
        />
      )}
    </div>
  );
}
