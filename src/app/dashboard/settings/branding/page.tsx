"use client";

import { useEffect, useState, useRef } from "react";
import {
  getBranding,
  updateBranding,
  uploadBrandingAsset,
  type BrandingConfig,
} from "@/services/branding";
import { COLOMBIA_DEPARTMENTS, getCitiesByDepartment } from "@/lib/colombia-locations";
import SearchableSelect from "@/components/SearchableSelect";

const PRESET_COLORS = [
  "#1e40af", "#0f766e", "#7c3aed", "#b91c1c",
  "#c2410c", "#047857", "#1d4ed8", "#374151",
];

function AssetUploader({
  label,
  hint,
  currentUrl,
  asset,
  onUploaded,
}: {
  label: string;
  hint: string;
  currentUrl: string | null;
  asset: "logo" | "signature" | "watermark";
  onUploaded: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setError("El archivo excede 2MB");
      return;
    }
    setError("");
    setUploading(true);
    try {
      await uploadBrandingAsset(asset, file);
      onUploaded();
    } catch {
      setError("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <p className="text-xs text-gray-500">{hint}</p>
      <div className="flex items-center gap-3">
        {currentUrl && (
          <img
            src={currentUrl}
            alt={label}
            className="h-12 w-auto max-w-[120px] object-contain border rounded bg-gray-50 p-1"
          />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : currentUrl ? "Cambiar imagen" : "Subir imagen"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function BrandingPage() {
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [clinicName, setClinicName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1e40af");
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicDepartment, setClinicDepartment] = useState("");
  const [clinicCity, setClinicCity] = useState("");
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.12);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  function loadBranding() {
    setLoading(true);
    getBranding()
      .then((b) => {
        setBranding(b);
        setClinicName(b.name ?? "");
        setPrimaryColor(b.primaryColor ?? "#1e40af");
        setClinicPhone(b.clinicPhone ?? "");
        setClinicAddress(b.clinicAddress ?? "");
        setClinicDepartment(b.clinicDepartment ?? "");
        setClinicCity(b.clinicCity ?? "");
        setWatermarkEnabled(b.watermarkEnabled);
        setWatermarkOpacity(b.watermarkOpacity);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadBranding(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await updateBranding({
        name: clinicName.trim() || undefined,
        primaryColor,
        clinicPhone: clinicPhone || undefined,
        clinicAddress: clinicAddress || undefined,
        clinicDepartment: clinicDepartment || undefined,
        clinicCity: clinicCity || undefined,
        watermarkEnabled,
        watermarkOpacity,
      });
      setBranding(updated);
      setSaveMsg("Configuración guardada");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración de marca</h1>
        <p className="text-sm text-gray-500 mt-1">
          Personaliza cómo se verán las fórmulas médicas enviadas a los clientes
        </p>
      </div>

      <div className="bg-white rounded-xl border p-5 space-y-6">
        <h2 className="font-semibold text-gray-800">Imágenes de la clínica</h2>
        <AssetUploader
          label="Logo de la clínica"
          hint="PNG o JPG, máx. 2MB. Aparece en el encabezado de las fórmulas."
          currentUrl={branding?.logoUrl ?? null}
          asset="logo"
          onUploaded={loadBranding}
        />
        <hr />
        <AssetUploader
          label="Firma predeterminada de la clínica"
          hint="PNG con fondo transparente, máx. 2MB. Se usa si el veterinario no tiene firma propia."
          currentUrl={branding?.defaultSignatureUrl ?? null}
          asset="signature"
          onUploaded={loadBranding}
        />
        <hr />
        <AssetUploader
          label="Imagen de marca de agua"
          hint="PNG con transparencia, máx. 2MB. Si no se sube, se usa el logo."
          currentUrl={branding?.watermarkUrl ?? null}
          asset="watermark"
          onUploaded={loadBranding}
        />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Color principal</h2>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setPrimaryColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  primaryColor === c ? "border-gray-900 scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-9 w-16 cursor-pointer rounded border"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => {
                if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                  setPrimaryColor(e.target.value);
                }
              }}
              className="border rounded-lg px-3 py-2 text-sm w-32 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="#1e40af"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Datos del encabezado</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la clínica</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="ej: Clínica Veterinaria San Roque"
              maxLength={100}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-400 mt-1">Aparece en el sidebar y en los documentos generados</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono(s)</label>
            <input
              type="text"
              value={clinicPhone}
              onChange={(e) => setClinicPhone(e.target.value)}
              placeholder="ej: 601 234 5678 / 315 000 0000"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
              placeholder="ej: Calle 45 # 12-34, Barrio Centro"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-400 mt-1">Aparece en el encabezado de las fórmulas médicas</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <SearchableSelect
                options={COLOMBIA_DEPARTMENTS.map((d) => d.name)}
                value={clinicDepartment}
                onChange={(v) => { setClinicDepartment(v); setClinicCity(""); }}
                placeholder="Buscar departamento..."
                variant="light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad / Municipio</label>
              <SearchableSelect
                options={getCitiesByDepartment(clinicDepartment)}
                value={clinicCity}
                onChange={setClinicCity}
                placeholder="Buscar ciudad..."
                disabled={!clinicDepartment}
                variant="light"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Marca de agua</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Activar marca de agua</p>
              <p className="text-xs text-gray-500">Aparece centrada en el cuerpo de la fórmula</p>
            </div>
            <button
              type="button"
              onClick={() => setWatermarkEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                watermarkEnabled ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                  watermarkEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {watermarkEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opacidad: {Math.round(watermarkOpacity * 100)}%
              </label>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={Math.round(watermarkOpacity * 100)}
                onChange={(e) => setWatermarkOpacity(Number(e.target.value) / 100)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5%</span>
                <span>30%</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          {saveMsg && (
            <p className={`text-sm ${saveMsg.includes("Error") ? "text-red-600" : "text-green-600"}`}>
              {saveMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}
