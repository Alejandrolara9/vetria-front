"use client";

import { useState, useEffect, useRef } from "react";
import { getProducts, type Product } from "@/services/inventory";

export interface MedicationItemValue {
  productId?: string;
  productName: string;
  quantity: string;
  instructions: string;
  order: number;
}

interface Props {
  value: MedicationItemValue;
  index: number;
  onChange: (index: number, value: MedicationItemValue) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

export function MedicationItem({ value, index, onChange, onRemove, showRemove }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProducts({ active: true }).then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleNameChange(name: string) {
    onChange(index, { ...value, productName: name, productId: undefined });
    if (name.length >= 2) {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(name.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }

  function selectProduct(product: Product) {
    onChange(index, {
      ...value,
      productId: product.id,
      productName: product.name,
      quantity: value.quantity || `1 ${product.unit}`,
    });
    setShowSuggestions(false);
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Medicamento {index + 1}
        </span>
        {showRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Eliminar
          </button>
        )}
      </div>

      {/* Product name with autocomplete */}
      <div ref={containerRef} className="relative">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Nombre del medicamento <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={value.productName}
          onChange={(e) => handleNameChange(e.target.value)}
          onFocus={() => {
            if (value.productName.length >= 2 && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Buscar en inventario o escribir nombre"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {value.productId && (
          <span className="absolute right-2 top-8 text-xs text-green-600">
            ✓ inventario
          </span>
        )}
        {showSuggestions && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onMouseDown={() => selectProduct(p)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex justify-between"
                >
                  <span>{p.name}</span>
                  <span className="text-xs text-gray-400">
                    Stock: {p.stock} {p.unit}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={value.quantity}
            onChange={(e) => onChange(index, { ...value, quantity: e.target.value })}
            placeholder='ej: "20 tabletas", "30ml"'
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Indicaciones <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={value.instructions}
            onChange={(e) => onChange(index, { ...value, instructions: e.target.value })}
            placeholder='ej: "1 tableta cada 12h por 5 días"'
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}
