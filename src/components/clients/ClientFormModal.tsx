// src/components/clients/ClientFormModal.tsx
"use client";

import { useState } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { BREEDS } from "@/lib/breeds";
import { api } from "@/services/api";
import type { ClientWithPets } from "./ClientCard";

interface ClientFormModalProps {
  client?: ClientWithPets | null;
  onSave: () => void;
  onClose: () => void;
}

export function ClientFormModal({ client, onSave, onClose }: ClientFormModalProps) {
  const [clientForm, setClientForm] = useState({
    name: client?.name ?? "",
    phone: client?.phone ?? "",
    email: client?.email ?? "",
  });
  const [showPet, setShowPet] = useState(!client);
  type PetFormState = { name: string; species: string; breed: string; birthDate: string };
  const [petForms, setPetForms] = useState<PetFormState[]>([{ name: "", species: "", breed: "", birthDate: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (client) {
        await api.put(`/clients/${client.id}`, clientForm);
      } else {
        const res = await api.post<{ id: string }>("/clients", clientForm);
        if (showPet) {
          for (const pf of petForms) {
            if (pf.name && pf.species) {
              await api.post("/pets", {
                name: pf.name,
                species: pf.species,
                breed: pf.breed || undefined,
                birthDate: pf.birthDate || undefined,
                clientId: res.data.id,
              });
            }
          }
        }
      }
      onSave();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{client ? "Editar cliente" : "Nuevo cliente"}</h2>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Datos del cliente */}
          <div className="space-y-3">
            <input
              type="text" placeholder="Nombre completo" required
              className="w-full px-4 py-2 border border-border rounded-lg text-sm"
              value={clientForm.name}
              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
            />
            <input
              type="tel" placeholder="Teléfono" required
              className="w-full px-4 py-2 border border-border rounded-lg text-sm"
              value={clientForm.phone}
              onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
            />
            <input
              type="email" placeholder="Correo electrónico (opcional)"
              className="w-full px-4 py-2 border border-border rounded-lg text-sm"
              value={clientForm.email}
              onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
            />
          </div>

          {/* Primera mascota — solo para clientes nuevos */}
          {!client && (
            showPet ? (
              <div className="space-y-3">
                {petForms.map((pf, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        {idx === 0 ? "Primera mascota" : `Mascota ${idx + 1}`}
                      </p>
                      {petForms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPetForms(petForms.filter((_, i) => i !== idx))}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                    <input
                      type="text" placeholder="Nombre de la mascota" required
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                      value={pf.name}
                      onChange={(e) => setPetForms(petForms.map((p, i) => i === idx ? { ...p, name: e.target.value } : p))}
                    />
                    <select
                      required
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                      value={pf.species}
                      onChange={(e) => setPetForms(petForms.map((p, i) => i === idx ? { ...p, species: e.target.value, breed: "" } : p))}
                    >
                      <option value="">Seleccionar especie</option>
                      <option value="Canino">Canino</option>
                      <option value="Felino">Felino</option>
                      <option value="Ave">Ave</option>
                      <option value="Reptil">Reptil</option>
                      <option value="Roedor">Roedor</option>
                      <option value="Otro">Otro</option>
                    </select>
                    {BREEDS[pf.species] ? (
                      <SearchableSelect
                        options={BREEDS[pf.species]}
                        value={pf.breed}
                        onChange={(v) => setPetForms(petForms.map((p, i) => i === idx ? { ...p, breed: v } : p))}
                        placeholder="Seleccionar raza"
                      />
                    ) : (
                      <input
                        type="text" placeholder="Raza (opcional)"
                        className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                        value={pf.breed}
                        onChange={(e) => setPetForms(petForms.map((p, i) => i === idx ? { ...p, breed: e.target.value } : p))}
                      />
                    )}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Fecha de nacimiento (opcional)</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-border rounded-lg text-sm"
                        value={pf.birthDate}
                        onChange={(e) => setPetForms(petForms.map((p, i) => i === idx ? { ...p, birthDate: e.target.value } : p))}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPetForms([...petForms, { name: "", species: "", breed: "", birthDate: "" }])}
                    className="text-xs text-teal-600 hover:underline"
                  >
                    + Agregar otra mascota
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPet(false)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Registrar sin mascota por ahora
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPet(true)}
                className="text-xs text-teal-600 hover:underline"
              >
                + Agregar mascota al registro
              </button>
            )
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-500 text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Guardando..." : client ? "Actualizar" : "Registrar"}
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
