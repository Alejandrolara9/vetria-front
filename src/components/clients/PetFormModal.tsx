// src/components/clients/PetFormModal.tsx
"use client";

import { useState } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { BREEDS } from "@/lib/breeds";
import { api } from "@/services/api";
import type { Pet } from "./PetCard";

interface PetFormModalProps {
  clientId: string;
  pet?: Pet | null;
  onSave: () => void;
  onClose: () => void;
}

export function PetFormModal({ clientId, pet, onSave, onClose }: PetFormModalProps) {
  const [form, setForm] = useState({
    name: pet?.name ?? "",
    species: pet?.species ?? "",
    breed: pet?.breed ?? "",
    birthDate: pet?.birthDate ? pet.birthDate.split("T")[0] : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        species: form.species,
        breed: form.breed || undefined,
        clientId,
        birthDate: form.birthDate || undefined,
      };
      if (pet) {
        await api.put(`/pets/${pet.id}`, payload);
      } else {
        await api.post("/pets", payload);
      }
      onSave();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Error al guardar la mascota");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{pet ? "Editar mascota" : "Nueva mascota"}</h2>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text" placeholder="Nombre de la mascota" required
            className="px-4 py-2 border border-border rounded-lg text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            required
            className="px-4 py-2 border border-border rounded-lg text-sm"
            value={form.species}
            onChange={(e) => setForm({ ...form, species: e.target.value, breed: "" })}
          >
            <option value="">Seleccionar especie</option>
            <option value="Canino">Canino</option>
            <option value="Felino">Felino</option>
            <option value="Ave">Ave</option>
            <option value="Reptil">Reptil</option>
            <option value="Roedor">Roedor</option>
            <option value="Otro">Otro</option>
          </select>
          {BREEDS[form.species] ? (
            <SearchableSelect
              options={BREEDS[form.species]}
              value={form.breed}
              onChange={(v) => setForm({ ...form, breed: v })}
              placeholder="Seleccionar raza"
            />
          ) : (
            <input
              type="text" placeholder="Raza (opcional)"
              className="px-4 py-2 border border-border rounded-lg text-sm"
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
            />
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Fecha de nacimiento (opcional)</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-border rounded-lg text-sm"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
          </div>
          <div className="flex gap-2 mt-1">
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Guardando..." : pet ? "Actualizar" : "Guardar"}
            </button>
            <button
              type="button" onClick={onClose}
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
