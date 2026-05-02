"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPrescription, type Prescription } from "@/services/prescriptions";

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

export default function PrescriptionPrintPage() {
  const { id } = useParams<{ id: string }>();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPrescription(id)
      .then(setPrescription)
      .catch(() => setError("No se pudo cargar la fórmula"));
  }, [id]);

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  if (!prescription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const p = prescription;
  const t = p.tenant;
  const primaryColor = t.primaryColor || "#2563eb";

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          @page { margin: 1.5cm 1.8cm; size: A4; }
        }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
      `}</style>

      {/* Barra de acciones — solo visible en pantalla */}
      <div className="no-print fixed top-0 left-0 right-0 bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between z-50">
        <p className="text-sm text-gray-600">
          Vista previa de la fórmula médica — usa{" "}
          <kbd className="bg-gray-100 border rounded px-1.5 py-0.5 text-xs font-mono">Ctrl+P</kbd> o el botón para imprimir / guardar como PDF
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => window.history.back()}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            ← Volver
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 text-sm font-medium text-white rounded-lg"
            style={{ backgroundColor: primaryColor }}
          >
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* Contenido imprimible */}
      <div className="pt-16 no-print-padding">
        <div
          className="max-w-[794px] mx-auto bg-white p-10 min-h-[1122px]"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
          {/* Encabezado clínica */}
          <div className="flex items-start justify-between mb-6 pb-5 border-b-2" style={{ borderColor: primaryColor }}>
            <div className="flex items-center gap-4">
              {t.logoUrl ? (
                <img src={t.logoUrl} alt={t.name} className="h-16 w-auto object-contain" />
              ) : (
                <div
                  className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t.name}</h1>
                {t.clinicAddress && <p className="text-xs text-gray-500 mt-0.5">{t.clinicAddress}{t.clinicCity ? `, ${t.clinicCity}` : ""}</p>}
                {t.clinicPhone && <p className="text-xs text-gray-500">Tel: {t.clinicPhone}</p>}
              </div>
            </div>
            <div className="text-right">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: primaryColor }}
              >
                Fórmula Médica
              </p>
              <p className="text-xs text-gray-500">Fecha: {formatDate(p.issueDate)}</p>
              {p.nextControlDate && (
                <p className="text-xs text-gray-500">Próximo control: {formatDate(p.nextControlDate)}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-1">Ref: {p.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          {/* Datos paciente + propietario */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Paciente</p>
              <table className="text-sm w-full">
                <tbody>
                  <tr><td className="text-gray-500 pr-3 py-0.5 w-20">Nombre</td><td className="font-semibold">{p.pet.name}</td></tr>
                  <tr><td className="text-gray-500 pr-3 py-0.5">Especie</td><td>{p.pet.species}</td></tr>
                  {p.pet.breed && <tr><td className="text-gray-500 pr-3 py-0.5">Raza</td><td>{p.pet.breed}</td></tr>}
                  <tr><td className="text-gray-500 pr-3 py-0.5">Edad</td><td>{calcAge(p.pet.birthDate)}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Propietario</p>
              <table className="text-sm w-full">
                <tbody>
                  <tr><td className="text-gray-500 pr-3 py-0.5 w-20">Nombre</td><td className="font-semibold">{p.pet.client.name}</td></tr>
                  <tr><td className="text-gray-500 pr-3 py-0.5">Teléfono</td><td>{p.pet.client.phone}</td></tr>
                  <tr><td className="text-gray-500 pr-3 py-0.5">Email</td><td className="break-all">{p.pet.client.email}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Medicamentos */}
          <div className="mb-6">
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: primaryColor }}
            >
              Medicamentos prescritos
            </p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ backgroundColor: primaryColor }}>
                  <th className="text-left text-white text-xs font-semibold px-3 py-2 w-8 rounded-tl">#</th>
                  <th className="text-left text-white text-xs font-semibold px-3 py-2">Medicamento</th>
                  <th className="text-left text-white text-xs font-semibold px-3 py-2 w-28">Cantidad</th>
                  <th className="text-left text-white text-xs font-semibold px-3 py-2 rounded-tr">Indicaciones</th>
                </tr>
              </thead>
              <tbody>
                {p.items.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-2.5 text-gray-400 border-b border-gray-100">{item.order + 1}</td>
                    <td className="px-3 py-2.5 font-medium border-b border-gray-100">{item.productName}</td>
                    <td className="px-3 py-2.5 text-gray-600 border-b border-gray-100">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-gray-600 border-b border-gray-100">{item.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Observaciones */}
          {p.observations && (
            <div className="mb-6 border-l-4 pl-4 py-2" style={{ borderColor: primaryColor }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Observaciones</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.observations}</p>
            </div>
          )}

          {/* Firma veterinario */}
          <div className="mt-12 pt-6 border-t border-gray-200 flex justify-end">
            <div className="text-center min-w-[200px]">
              {p.vet.signatureUrl ? (
                <img
                  src={p.vet.signatureUrl}
                  alt="Firma"
                  className="h-16 mx-auto mb-1 object-contain"
                />
              ) : (
                <div className="h-16 mb-1 border-b border-dashed border-gray-300" />
              )}
              <p className="text-sm font-semibold text-gray-800">{p.vet.name}</p>
              {p.vet.licenseNumber && (
                <p className="text-xs text-gray-500">T.P. {p.vet.licenseNumber}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">Médico Veterinario</p>
            </div>
          </div>

          {/* Pie de página */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400">
              Documento generado el {formatDate(new Date().toISOString())} — {t.name}
              {t.clinicCity ? ` — ${t.clinicCity}` : ""}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
