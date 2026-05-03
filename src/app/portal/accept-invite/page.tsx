"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { validateInviteToken, acceptInvite, saveOwnerToken } from "@/services/owner-portal";

function AcceptInviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (!token) { setError("Enlace inválido"); setLoading(false); return; }
    validateInviteToken(token)
      .then((data) => { setEmail(data.email); setTokenValid(true); })
      .catch(() =>
        setError("El enlace no es válido o ya expiró. Pide a tu veterinaria que te reenvíe la invitación.")
      )
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await acceptInvite({ token, name, password });
      saveOwnerToken(res.token);
      router.push("/portal/pets");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al activar la cuenta";
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Verificando enlace...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-red-400 font-semibold mb-2">Enlace inválido</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-6 py-12 min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Activa tu cuenta</h1>
          <p className="text-slate-400 text-sm">
            Ingreso para <span className="text-blue-400">{email}</span>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Tu nombre
              </label>
              <input
                type="text"
                placeholder="Carlos López"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold rounded-xl transition-all text-sm mt-2"
            >
              {submitting ? "Activando..." : "Activar mi cuenta →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Cargando...</p>
      </div>
    }>
      <AcceptInviteForm />
    </Suspense>
  );
}
