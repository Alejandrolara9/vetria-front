"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { createPrescription, type PrescriptionItemInput } from "@/services/prescriptions";
import { MedicationItem, type MedicationItemValue } from "@/components/prescriptions/MedicationItem";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  client: { name: string };
}

function newMedication(order: number): MedicationItemValue {
  return { productName: "", quantity: "", instructions: "", order };
}

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [petSearch, setPetSearch] = useState("");
  const [petId, setPetId] = useState("");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showPetList, setShowPetList] = useState(false);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [nextControlDate, setNextControlDate] = useState("");
  const [observations, setObservations] = useState("");
  const [medications, setMedications] = useState<MedicationItemValue[]>([newMedication(0)]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Pet[]>("/pets?active=true").then((r) => setPets(r.data)).catch(() => {});
  }, []);

  const filteredPets = pets.filter((p) =>
    !petSearch ||
    p.name.toLowerCase().includes(petSearch.toLowerCase()) ||
    p.client.name.toLowerCase().includes(petSearch.toLowerCase())
  ).slice(0, 8);

  function selectPet(p: Pet) {
    setSelectedPet(p);
    setPetId(p.id);
    setPetSearch(`${p.name} — ${p.client.name}`);
    setShowPetList(false);
  }

  function handleMedicationChange(index: number, value: MedicationItemValue) {
    setMedications((prev) => prev.map((m, i) => (i === index ? { ...value, order: index } : m)));
  }

  function handleMedicationRemove(index: number) {
    setMedications((prev) => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i })));
  }

  function addMedication() {
    setMedications((prev) => [...prev, newMedication(prev.length)]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!petId) { setError("Debes seleccionar un paciente"); return; }
    if (medications.some((m) => !m.productName || !m.quantity || !m.instructions)) {
      setError("Completa todos los campos de los medicamentos");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const items: PrescriptionItemInput[] = medications.map((m) => ({
        productId: m.productId,
        productName: m.productName,
        quantity: m.quantity,
        instructions: m.instructions,
        order: m.order,
      }));
      const prescription = await createPrescription({
        petId,
        issueDate: new Date(issueDate).toISOString(),
        nextControlDate: nextControlDate ? new Date(nextControlDate).toISOString() : undefined,
        observations: observations || undefined,
        items,
      });
      router.push(`/dashboard/prescriptions/${prescription.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? "Error al crear la fórmula");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </button>
        <h1 className="text-xl font-bold text-gray-900">Nueva fórmula médica</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient selector */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Paciente</h2>
          <div className="relative">
            <input
              type="text"
              value={petSearch}
              onChange={(e) => { setPetSearch(e.target.value); setPetId(""); setSelectedPet(null); setShowPetList(true); }}
              onFocus={() => setShowPetList(true)}
              onBlur={() => setTimeout(() => setShowPetList(false), 150)}
              placeholder="Buscar paciente por nombre o propietario..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {showPetList && filteredPets.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
                {filteredPets.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseDown={() => selectPet(p)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-gray-500 ml-2">— {p.client.name}</span>
                      <span className="text-gray-400 ml-1 text-xs">({p.species})</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedPet && (
            <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
              Paciente seleccionado: <strong>{selectedPet.name}</strong> ({selectedPet.species}
              {selectedPet.breed ? ` — ${selectedPet.breed}` : ""}) · Propietario: {selectedPet.client.name}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Fechas</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de emisión</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Próximo control <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="date"
                value={nextControlDate}
                onChange={(e) => setNextControlDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {nextControlDate && (
                <p className="text-xs text-blue-600 mt-1">
                  Se creará un recordatorio automático de control
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Medicamentos</h2>
            <button
              type="button"
              onClick={addMedication}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              + Agregar medicamento
            </button>
          </div>
          <div className="space-y-3">
            {medications.map((med, i) => (
              <MedicationItem
                key={i}
                index={i}
                value={med}
                onChange={handleMedicationChange}
                onRemove={handleMedicationRemove}
                showRemove={medications.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Observations */}
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <h2 className="font-semibold text-gray-800">
            Observaciones <span className="text-gray-400 font-normal text-sm">(opcional)</span>
          </h2>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
            placeholder="Indicaciones generales, restricciones de dieta, reposo, etc."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Guardar borrador"}
          </button>
        </div>
      </form>
    </div>
  );
}
