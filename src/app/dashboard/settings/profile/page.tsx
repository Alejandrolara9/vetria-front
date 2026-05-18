"use client";

import { useEffect, useState, useRef } from "react";
import { getMyProfile, updateMyProfile, uploadMySignature, setMyPassword, UserProfile } from "@/services/user-profile";
import PasswordStrengthChecklist, { isPasswordStrong } from "@/components/PasswordStrengthChecklist";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [sigError, setSigError] = useState("");
  const sigInputRef = useRef<HTMLInputElement>(null);

  // password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    getMyProfile().then((p) => {
      setProfile(p);
      setLicenseNumber(p.licenseNumber ?? "");
      setSignatureUrl(p.signatureUrl ?? null);
    });
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

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMsg("");

    if (!isPasswordStrong(newPassword)) {
      setPasswordError("La contraseña no cumple con todos los requisitos de seguridad");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    setPasswordSaving(true);
    try {
      await setMyPassword({
        ...(profile?.hasPassword ? { currentPassword } : {}),
        newPassword,
      });
      setPasswordMsg(profile?.hasPassword ? "Contraseña cambiada correctamente" : "Contraseña establecida correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProfile((prev) => prev ? { ...prev, hasPassword: true } : prev);
      setTimeout(() => setPasswordMsg(""), 4000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPasswordError(msg ?? "Error al cambiar la contraseña");
    } finally {
      setPasswordSaving(false);
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
        {profile && (
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">Nombre</dt>
              <dd className="font-medium">{profile.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28 shrink-0">Rol</dt>
              <dd>{profile.role}</dd>
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

      {/* Security — set or change password */}
      <form onSubmit={handlePasswordSubmit} className="bg-white rounded-xl border p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-800">Seguridad</h2>
          {profile && !profile.hasPassword && (
            <p className="text-xs text-amber-600 mt-1">
              Tu cuenta usa Google para ingresar. Puedes establecer una contraseña como método de acceso alternativo.
            </p>
          )}
        </div>

        {profile?.hasPassword && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña actual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {profile?.hasPassword ? "Nueva contraseña" : "Contraseña"}
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {newPassword && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
              <PasswordStrengthChecklist
                password={newPassword}
                className="[&_li]:text-gray-500 [&_li.text-green-400]:text-green-600"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar contraseña
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            required
            minLength={8}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-end gap-4">
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordMsg && <p className="text-sm text-green-600">{passwordMsg}</p>}
          <button
            type="submit"
            disabled={passwordSaving || !isPasswordStrong(newPassword) || newPassword !== confirmPassword}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {passwordSaving
              ? "Guardando..."
              : profile?.hasPassword
              ? "Cambiar contraseña"
              : "Establecer contraseña"}
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
            // eslint-disable-next-line @next/next/no-img-element
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
              if (e.target.files?.[0]) handleSignatureUpload(e.target.files?.[0]);
            }}
          />
        </div>
        {sigError && <p className="text-xs text-red-600">{sigError}</p>}
      </div>
    </div>
  );
}
