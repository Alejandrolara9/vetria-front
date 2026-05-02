"use client";

import { useEffect, useState, useRef } from "react";
import { updateMyProfile, uploadMySignature } from "@/services/user-profile";

interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
}

function decodeToken(): TokenPayload | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [sigError, setSigError] = useState("");
  const sigInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const payload = decodeToken();
    setUser(payload);
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      await updateMyProfile({ licenseNumber: licenseNumber || undefined });
      setSaveMsg("Perfil actualizado correctamente");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Error al guardar el perfil");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignatureUpload(file: File) {
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setSigError("Solo se permiten imágenes PNG o JPG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSigError("La imagen excede 2MB");
      return;
    }
    setSigError("");
    setUploadingSignature(true);
    try {
      await uploadMySignature(file);
      setSignatureUrl(URL.createObjectURL(file));
      setSaveMsg("Firma subida correctamente");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSigError("Error al subir la firma");
    } finally {
      setUploadingSignature(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configura tu firma y tarjeta profesional para las fórmulas médicas
        </p>
      </div>

      <div className="bg-white rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold text-gray-800">Información básica</h2>
        {user && (
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">Nombre</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">Rol</dt>
              <dd>{user.role}</dd>
            </div>
          </dl>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Datos profesionales</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de tarjeta profesional (T.P.)
          </label>
          <input
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="ej: 39068"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-gray-500 mt-1">
            Aparecerá debajo de tu firma en las fórmulas médicas emitidas
          </p>
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
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Firma personal</h2>
        <p className="text-sm text-gray-500">
          Sube una imagen PNG con fondo transparente de tu firma manuscrita (máx. 2MB).
          Aparecerá en todas las fórmulas médicas que emitas.
        </p>
        <div className="flex items-center gap-4">
          {signatureUrl && (
            <img
              src={signatureUrl}
              alt="Firma"
              className="h-16 w-auto max-w-[200px] object-contain border rounded bg-gray-50 p-2"
            />
          )}
          <button
            type="button"
            onClick={() => sigInputRef.current?.click()}
            disabled={uploadingSignature}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {uploadingSignature
              ? "Subiendo..."
              : signatureUrl
              ? "Cambiar firma"
              : "Subir firma"}
          </button>
          <input
            ref={sigInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleSignatureUpload(e.target.files[0]);
            }}
          />
        </div>
        {sigError && <p className="text-xs text-red-600">{sigError}</p>}
      </div>
    </div>
  );
}
