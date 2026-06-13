"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setMyPassword } from "@/services/user-profile";
import PasswordStrengthChecklist, { isPasswordStrong } from "@/components/PasswordStrengthChecklist";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newMatchesConfirm = form.newPassword === form.confirmPassword;
  const newDiffersFromCurrent = form.newPassword !== form.currentPassword;
  const canSubmit =
    form.currentPassword.length > 0 &&
    isPasswordStrong(form.newPassword) &&
    newDiffersFromCurrent &&
    newMatchesConfirm &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await setMyPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Error al cambiar la contraseña. Verifica tu contraseña actual.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-xl shadow-sm border w-full max-w-md p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Cambiar contraseña</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Por seguridad debes establecer una nueva contraseña antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña actual</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tu contraseña actual"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Mínimo 8 caracteres"
            />
            {form.newPassword && (
              <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border">
                <PasswordStrengthChecklist
                  password={form.newPassword}
                  className="[&_li]:text-gray-500 [&_li.text-green-400]:text-green-600"
                />
                {form.newPassword && !newDiffersFromCurrent && (
                  <p className="text-xs text-red-500 mt-1">La nueva contraseña debe ser diferente a la actual.</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirmar nueva contraseña</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Repite la nueva contraseña"
            />
            {form.confirmPassword && !newMatchesConfirm && (
              <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 mt-2"
          >
            {submitting ? "Cambiando contraseña..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
