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

function buildVetPattern(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <g transform="translate(38,52) rotate(-15)" fill="${color}">
      <ellipse cx="0" cy="7" rx="12" ry="10"/>
      <ellipse cx="-12" cy="-5" rx="5.5" ry="7"/>
      <ellipse cx="-4" cy="-14" rx="5.5" ry="7"/>
      <ellipse cx="6" cy="-14" rx="5.5" ry="7"/>
      <ellipse cx="13" cy="-5" rx="5.5" ry="7"/>
    </g>
    <g transform="translate(152,148) rotate(40)" fill="${color}">
      <rect x="-15" y="-4.5" width="30" height="9" rx="4"/>
      <circle cx="-16" cy="-7" r="6"/>
      <circle cx="-16" cy="7" r="6"/>
      <circle cx="16" cy="-7" r="6"/>
      <circle cx="16" cy="7" r="6"/>
    </g>
    <g transform="translate(125,75) rotate(20) scale(0.65)" fill="${color}">
      <ellipse cx="0" cy="7" rx="12" ry="10"/>
      <ellipse cx="-12" cy="-5" rx="5.5" ry="7"/>
      <ellipse cx="-4" cy="-14" rx="5.5" ry="7"/>
      <ellipse cx="6" cy="-14" rx="5.5" ry="7"/>
      <ellipse cx="13" cy="-5" rx="5.5" ry="7"/>
    </g>
    <g transform="translate(168,28) rotate(-35) scale(0.55)" fill="${color}">
      <rect x="-15" y="-4.5" width="30" height="9" rx="4"/>
      <circle cx="-16" cy="-7" r="6"/>
      <circle cx="-16" cy="7" r="6"/>
      <circle cx="16" cy="-7" r="6"/>
      <circle cx="16" cy="7" r="6"/>
    </g>
    <g transform="translate(20,160) rotate(10) scale(0.5)" fill="${color}">
      <ellipse cx="0" cy="7" rx="12" ry="10"/>
      <ellipse cx="-12" cy="-5" rx="5.5" ry="7"/>
      <ellipse cx="-4" cy="-14" rx="5.5" ry="7"/>
      <ellipse cx="6" cy="-14" rx="5.5" ry="7"/>
      <ellipse cx="13" cy="-5" rx="5.5" ry="7"/>
    </g>
    <g transform="translate(85,160) rotate(-20) scale(0.5)" fill="${color}">
      <rect x="-15" y="-4.5" width="30" height="9" rx="4"/>
      <circle cx="-16" cy="-7" r="6"/>
      <circle cx="-16" cy="7" r="6"/>
      <circle cx="16" cy="-7" r="6"/>
      <circle cx="16" cy="7" r="6"/>
    </g>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <tr>
      <td className="text-gray-500 pr-3 py-0.5 align-top whitespace-nowrap text-xs w-24">{label}</td>
      <td className="text-gray-900 text-xs py-0.5 font-medium">{value}</td>
    </tr>
  );
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

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!prescription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const p = prescription;
  const t = p.tenant;
  const primary = t.primaryColor || "#1e40af";
  const ref = p.id.slice(-8).toUpperCase();
  const watermarkSrc = t.watermarkEnabled ? (t.watermarkUrl ?? t.logoUrl) : null;
  const watermarkOpacity = t.watermarkOpacity ?? 0.12;
  const sigSrc = p.vet.signatureUrl ?? t.defaultSignatureUrl ?? null;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          aside, nav, header { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          .print-wrap { padding-top: 0 !important; }
          body { margin: 0; background: white; }
          @page { margin: 1.2cm 1.5cm; size: A4; }
        }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f3f4f6; }
      `}</style>

      {/* Barra de acciones */}
      <div className="no-print fixed top-0 left-0 right-0 bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between z-50">
        <p className="text-sm text-gray-600">
          Vista previa — usa{" "}
          <kbd className="bg-gray-100 border rounded px-1.5 py-0.5 text-xs font-mono">Ctrl+P</kbd>{" "}
          para imprimir o guardar como PDF
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => window.close()}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            ← Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg"
            style={{ backgroundColor: primary }}
          >
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      <div className="print-wrap pt-16">
        <div
          className="relative max-w-[794px] mx-auto bg-white shadow-lg overflow-hidden"
          style={{ minHeight: "1122px" }}
        >
          {/* Patrón de fondo: patitas y huesitos */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: buildVetPattern(primary),
              backgroundRepeat: "repeat",
              backgroundSize: "200px 200px",
              opacity: 0.055,
              zIndex: 0,
            }}
          />
          {/* Marca de agua */}
          {watermarkSrc && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <img
                src={watermarkSrc}
                alt=""
                style={{
                  width: "55%",
                  opacity: watermarkOpacity,
                  objectFit: "contain",
                }}
              />
            </div>
          )}

          {/* Contenido sobre la marca de agua */}
          <div className="relative z-10 p-10">

            {/* ENCABEZADO */}
            <div className="flex items-start justify-between mb-6">
              {/* Logo + datos clínica */}
              <div className="flex items-center gap-4">
                {t.logoUrl ? (
                  <img src={t.logoUrl} alt={t.name} className="h-20 w-auto max-w-[160px] object-contain" />
                ) : (
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black flex-shrink-0"
                    style={{ backgroundColor: primary }}
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xl font-black text-gray-900 leading-tight">{t.name}</p>
                  {t.clinicAddress && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t.clinicAddress}{t.clinicCity ? `, ${t.clinicCity}` : ""}
                    </p>
                  )}
                  {t.clinicPhone && (
                    <p className="text-xs text-gray-500">Tel: {t.clinicPhone}</p>
                  )}
                </div>
              </div>

              {/* Bloque decorativo derecho */}
              <div
                className="rounded-2xl px-5 py-3 text-right flex-shrink-0"
                style={{ backgroundColor: `${primary}18` }}
              >
                <p
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: primary }}
                >
                  Fórmula Médica
                </p>
                <p className="text-[11px] text-gray-500 mt-1">Fecha: {formatDate(p.issueDate)}</p>
                {p.nextControlDate && (
                  <p className="text-[11px] text-gray-500">
                    Próx. control: {formatDate(p.nextControlDate)}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1 font-mono">Ref: {ref}</p>
              </div>
            </div>

            {/* Línea separadora */}
            <div className="h-1 rounded-full mb-6" style={{ backgroundColor: primary }} />

            {/* DATOS PACIENTE + PROPIETARIO */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-100 rounded-xl p-4 bg-white/80">
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{ color: primary }}
                >
                  Datos del Paciente
                </p>
                <table className="w-full">
                  <tbody>
                    <InfoRow label="Nombre" value={p.pet.name} />
                    <InfoRow label="Especie" value={p.pet.species} />
                    <InfoRow label="Raza" value={p.pet.breed} />
                    <InfoRow label="Edad" value={calcAge(p.pet.birthDate)} />
                  </tbody>
                </table>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 bg-white/80">
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{ color: primary }}
                >
                  Datos del Propietario
                </p>
                <table className="w-full">
                  <tbody>
                    <InfoRow label="Nombre" value={p.pet.client.name} />
                    <InfoRow label="Teléfono" value={p.pet.client.phone} />
                    <InfoRow label="Email" value={p.pet.client.email} />
                  </tbody>
                </table>
              </div>
            </div>

            {/* MEDICAMENTOS */}
            <div className="mb-6">
              <p
                className="text-[10px] font-black uppercase tracking-widest mb-3"
                style={{ color: primary }}
              >
                Medicamentos Prescritos
              </p>
              <table className="w-full text-xs border-collapse rounded-xl overflow-hidden">
                <thead>
                  <tr style={{ backgroundColor: primary }}>
                    <th className="text-left text-white font-bold px-3 py-2.5 w-8">#</th>
                    <th className="text-left text-white font-bold px-3 py-2.5 w-[28%]">Producto</th>
                    <th className="text-left text-white font-bold px-3 py-2.5 w-24">Cantidad</th>
                    <th className="text-left text-white font-bold px-3 py-2.5">Indicaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {p.items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100"
                      style={{ backgroundColor: idx % 2 === 0 ? "white" : "#f9fafb" }}
                    >
                      <td className="px-3 py-2.5 text-gray-400">{item.order + 1}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-900">{item.productName}</td>
                      <td className="px-3 py-2.5 text-gray-600">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-gray-600">{item.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* OBSERVACIONES */}
            {p.observations && (
              <div
                className="mb-6 rounded-xl p-4 border-l-4"
                style={{ borderColor: primary, backgroundColor: `${primary}0d` }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-2"
                  style={{ color: primary }}
                >
                  Observaciones
                </p>
                <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {p.observations}
                </p>
              </div>
            )}

            {/* FIRMA */}
            <div className="mt-10 flex justify-end">
              <div className="text-center" style={{ minWidth: 180 }}>
                {sigSrc ? (
                  <img
                    src={sigSrc}
                    alt="Firma"
                    className="h-20 mx-auto mb-2 object-contain"
                  />
                ) : (
                  <div className="h-16 mb-2 border-b-2 border-dashed border-gray-300" />
                )}
                <div className="border-t border-gray-300 pt-2">
                  <p className="text-sm font-bold text-gray-900">{p.vet.name}</p>
                  {p.vet.licenseNumber && (
                    <p className="text-xs text-gray-500">T.P. {p.vet.licenseNumber}</p>
                  )}
                  <p className="text-xs text-gray-400">Médico Veterinario</p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                {(t.clinicPhone || t.clinicAddress) && (
                  <p className="text-[10px] text-gray-400">
                    {t.clinicPhone && `Tel: ${t.clinicPhone}`}
                    {t.clinicPhone && t.clinicAddress && "   ·   "}
                    {t.clinicAddress}
                    {t.clinicCity && `, ${t.clinicCity}`}
                  </p>
                )}
              </div>
              <p className="text-[10px] text-gray-300">
                Generado el {formatDate(new Date().toISOString())} · Ref {ref}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
