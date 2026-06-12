"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/services/api";
import type { MedicationItem } from "@/services/clinical-notes";

interface Props {
  medications: MedicationItem[];
  petId: string;
  vetId: string;
  clinicalNoteId: string;
  onClose: () => void;
}

interface EditableMedication {
  id: number;
  productId?: string;
  productName: string;
  quantity: string;
  instructions: string;
}

interface InventoryProduct {
  id: string;
  name: string;
}

function MedicationRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: EditableMedication;
  index: number;
  onChange: (index: number, field: keyof EditableMedication, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const [query, setQuery] = useState(item.productName);
  const [results, setResults] = useState<InventoryProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get<InventoryProduct[]>(
          `/inventory/products?search=${encodeURIComponent(query)}&limit=5`
        );
        const list = Array.isArray(res.data) ? res.data : [];
        setResults(list);
        setShowDropdown(list.length > 0);
      } catch {
        setResults([]);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Medicamento {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label="Quitar medicamento"
          className="text-gray-400 hover:text-red-500 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          placeholder="Nombre del medicamento"
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(index, "productName", e.target.value);
            onChange(index, "productId", "");
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showDropdown && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 text-sm max-h-40 overflow-auto">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-blue-50"
                  onMouseDown={() => {
                    setQuery(p.name);
                    onChange(index, "productName", p.name);
                    onChange(index, "productId", p.id);
                    setShowDropdown(false);
                  }}
                >
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="text-xs text-gray-500">Cantidad / Dosis</label>
        <input
          type="text"
          value={item.quantity}
          onChange={(e) => onChange(index, "quantity", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500">Instrucciones / Duración</label>
        <input
          type="text"
          value={item.instructions}
          onChange={(e) => onChange(index, "instructions", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

export function PrescriptionFromNoteModal({ medications, petId, vetId, clinicalNoteId, onClose }: Props) {
  const [items, setItems] = useState<EditableMedication[]>(
    medications.map((m, i) => ({
      id: i,
      productName: m.name,
      quantity: `${m.dose} ${m.frequency}`,
      instructions: `por ${m.duration}`,
    }))
  );
  const [notifyClient, setNotifyClient] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(index: number, field: keyof EditableMedication, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function handleRemove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAdd() {
    setItems((prev) => [...prev, { id: Date.now(), productName: "", quantity: "", instructions: "" }]);
  }

  async function handleSubmit() {
    if (items.find((i) => !i.productName.trim())) {
      setError("Todos los medicamentos deben tener nombre.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post("/prescriptions", {
        petId,
        vetId,
        clinicalNoteId,
        issueDate: new Date().toISOString(),
        notifyClient,
        items: items.map((item, i) => ({
          productId: item.productId || undefined,
          productName: item.productName,
          quantity: item.quantity,
          instructions: item.instructions,
          order: i + 1,
        })),
      });
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Error al crear la receta.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Crear receta médica</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">
            &times;
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {items.map((item, i) => (
            <MedicationRow key={item.id} item={item} index={i} onChange={handleChange} onRemove={handleRemove} />
          ))}

          <button
            type="button"
            onClick={handleAdd}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Agregar medicamento
          </button>

          <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
            <input
              type="checkbox"
              checked={notifyClient}
              onChange={(e) => setNotifyClient(e.target.checked)}
              className="rounded"
            />
            Enviar PDF al tutor por email
          </label>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Omitir
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear y enviar receta"}
          </button>
        </div>
      </div>
    </div>
  );
}
