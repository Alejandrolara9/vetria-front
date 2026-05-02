"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getPrescription,
  deletePrescription,
  sendPrescription,
  type Prescription,
  type PrescriptionStatus,
} from "@/services/prescriptions";

const STATUS_LABEL: Record<PrescriptionStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado al cliente",
  PRINTED: "PDF generado",
};

const STATUS_COLOR: Record<PrescriptionStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-green-100 text-green-700",
  PRINTED: "bg-blue-100 text-blue-700",
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

function calcAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const ms = Date.now() - new Date(birthDate).getTime();
  const years = Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
  if (years < 1) {
    const months = Math.floor(ms / (30.44 * 24 * 60 * 60 * 1000));
    return `${months} mes${months !== 1 ? "es" : ""}`;
  }
  return `${years} año${years !== 1 ? "s" : ""}`;
}

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPrescription(id)
      .then(setPrescription)
      .catch(() => setError("Fórmula no encontrada"))
      .finally(() => setLoading(false));
  }, [id]);

  function handleGeneratePdf() {
    window.open(`/dashboard/prescriptions/${id}/print`, "_blank");
  }

  async function handleSend() {
    if (!confirm("¿Generar el PDF y enviar la fórmula al email del propietario?")) return;
    setActionLoading("send");
    try {
      const updated = await sendPrescription(id);
      setPrescription(updated);
    } catch {
      alert("Error al enviar la fórmula");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!prescription) return;
    if (!confirm(`¿Eliminar la fórmula de ${prescription.pet.name}?`)) return;
    setActionLoading("delete");
    try {
      await deletePrescription(id);
      router.push("/dashboard/prescriptions");
    } catch {
      alert("No se pudo eliminar la fórmula");
      setActionLoading(null);
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

  if (error || !prescription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || "Fórmula no encontrada"}</p>
        <Link href="/dashboard/prescriptions" className="text-primary hover:underline text-sm mt-2 inline-block">
          ← Volver a la lista
        </Link>
      </div>
    );
  }

  const p = prescription;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/prescriptions" className="text-sm text-gray-500 hover:text-gray-700">
            ← Fórmulas
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-xl font-bold text-gray-900">
            Fórmula médica — {p.pet.name}
          </h1>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[p.status]}`}>
            {STATUS_LABEL[p.status]}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {p.status === "DRAFT" && (
          <>
            <Link
              href={`/dashboard/prescriptions/${id}/edit`}
              className="px-4 py-2 bg-white text-gray-700 border rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Editar borrador
            </Link>
            <button
              onClick={handleGeneratePdf}
              disabled={actionLoading !== null}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading === "pdf" ? "Generando PDF..." : "Generar PDF / Imprimir"}
            </button>
            <button
              onClick={handleSend}
              disabled={actionLoading !== null}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {actionLoading === "send" ? "Enviando..." : "Enviar al cliente por email"}
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading !== null}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100 disabled:opacity-50"
            >
              {actionLoading === "delete" ? "Eliminando..." : "Eliminar borrador"}
            </button>
          </>
        )}
        {(p.status === "PRINTED" || p.status === "SENT") && (
          <button
            onClick={handleGeneratePdf}
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            Ver / Imprimir plantilla
          </button>
        )}
        {p.status === "PRINTED" && (
          <button
            onClick={handleSend}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading === "send" ? "Enviando..." : "Enviar al cliente por email"}
          </button>
        )}
        {p.status === "SENT" && p.emailSentAt && (
          <span className="px-3 py-2 text-sm text-gray-500">
            Email enviado el {formatDate(p.emailSentAt)}
          </span>
        )}
      </div>

      {/* Pet + client card */}
      <div className="bg-white rounded-xl border p-5 grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Datos del paciente</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Nombre</dt><dd className="font-medium">{p.pet.name}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Especie</dt><dd>{p.pet.species}</dd></div>
            {p.pet.breed && <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Raza</dt><dd>{p.pet.breed}</dd></div>}
            <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Edad</dt><dd>{calcAge(p.pet.birthDate)}</dd></div>
          </dl>
        </div>
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Datos del propietario</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Nombre</dt><dd className="font-medium">{p.pet.client.name}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Teléfono</dt><dd>{p.pet.client.phone}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Email</dt><dd className="break-all">{p.pet.client.email}</dd></div>
          </dl>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Fechas</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Fecha de emisión</p>
            <p className="font-medium mt-1">{formatDate(p.issueDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Próximo control</p>
            <p className={`font-medium mt-1 ${p.nextControlDate ? "text-blue-700" : "text-gray-400"}`}>
              {p.nextControlDate ? formatDate(p.nextControlDate) : "No definido"}
            </p>
            {p.nextControlDate && p.reminderId && (
              <p className="text-xs text-green-600 mt-1">Recordatorio creado automáticamente</p>
            )}
          </div>
        </div>
      </div>

      {/* Medications */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Medicamentos prescritos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-2 w-8">#</th>
                <th className="pb-2">Medicamento</th>
                <th className="pb-2 w-32">Cantidad</th>
                <th className="pb-2">Indicaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {p.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-gray-400">{item.order + 1}</td>
                  <td className="py-3 font-medium">
                    {item.productName}
                    {item.productId && <span className="ml-1 text-xs text-green-600">(inventario)</span>}
                  </td>
                  <td className="py-3 text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-gray-600">{item.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observations */}
      {p.observations && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Observaciones</h2>
          <p className="text-sm text-amber-900 whitespace-pre-wrap">{p.observations}</p>
        </div>
      )}

      {/* Vet */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Veterinario responsable</h2>
        <p className="text-sm font-medium">{p.vet.name}</p>
        {p.vet.licenseNumber && (
          <p className="text-xs text-gray-500 mt-1">T.P. {p.vet.licenseNumber}</p>
        )}
      </div>
    </div>
  );
}
