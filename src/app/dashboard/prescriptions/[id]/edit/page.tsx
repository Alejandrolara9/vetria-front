"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getPrescription,
  updatePrescription,
  type PrescriptionItemInput,
} from "@/services/prescriptions";
import { MedicationItem, type MedicationItemValue } from "@/components/prescriptions/MedicationItem";

export default function EditPrescriptionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [nextControlDate, setNextControlDate] = useState("");
  const [observations, setObservations] = useState("");
  const [medications, setMedications] = useState<MedicationItemValue[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPrescription(id)
      .then((p) => {
        if (p.status !== "DRAFT") {
          router.replace(`/dashboard/prescriptions/${id}`);
          return;
        }
        setNextControlDate(
          p.nextControlDate ? p.nextControlDate.split("T")[0] : ""
        );
        setObservations(p.observations ?? "");
        setMedications(
          p.items.map((item) => ({
            productId: item.productId ?? undefined,
            productName: item.productName,
            quantity: item.quantity,
            instructions: item.instructions,
            order: item.order,
          }))
        );
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, router]);

  function handleMedicationChange(index: number, value: MedicationItemValue) {
    setMedications((prev) =>
      prev.map((m, i) => (i === index ? { ...value, order: index } : m))
    );
  }

  function handleMedicationRemove(index: number) {
    setMedications((prev) =>
      prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i }))
    );
  }

  function addMedication() {
    setMedications((prev) => [
      ...prev,
      { productName: "", quantity: "", instructions: "", order: prev.length },
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      await updatePrescription(id, {
        nextControlDate: nextControlDate
          ? new Date(nextControlDate).toISOString()
          : null,
        observations: observations || undefined,
        items,
      });
      router.push(`/dashboard/prescriptions/${id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 bg-gray-100 rounded animate-pulse w-1/3" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Fórmula no encontrada</p>
        <Link href="/dashboard/prescriptions" className="text-primary hover:underline text-sm mt-2 inline-block">
          ← Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/prescriptions/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver al detalle
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Editar fórmula médica</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Next control date */}
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <h2 className="font-semibold text-gray-800">Próximo control</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de próximo control{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="date"
              value={nextControlDate}
              onChange={(e) => setNextControlDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {nextControlDate && (
              <p className="text-xs text-blue-600 mt-1">
                Se creará/actualizará el recordatorio automático de control
              </p>
            )}
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
            Observaciones{" "}
            <span className="text-gray-400 font-normal text-sm">(opcional)</span>
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
          <Link
            href={`/dashboard/prescriptions/${id}`}
            className="px-5 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
