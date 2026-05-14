"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/services/api";
import PasswordStrengthChecklist, { isPasswordStrong } from "@/components/PasswordStrengthChecklist";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? ""; // NOSONAR S5131 — token arrives via email link (industry-standard); one-time-use, validated server-side

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!isPasswordStrong(password)) {
      setError("La contraseña no cumple con todos los requisitos");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-400 text-sm">Enlace inválido. Solicita uno nuevo.</p>
        <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm underline">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Contraseña actualizada</h2>
        <p className="text-slate-400 text-sm">Redirigiendo al inicio de sesión...</p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">Nueva contraseña</h1>
        <p className="text-slate-400 text-sm">Elige una contraseña segura para tu cuenta</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Nueva contraseña
          </label>
          <input
            type="password"
            placeholder="Mínimo 8 caracteres"
            required
            className="w-full px-4 py-3 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          />
          <PasswordStrengthChecklist password={password} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Confirmar contraseña
          </label>
          <input
            type="password"
            placeholder="Repite la contraseña"
            required
            className="w-full px-4 py-3 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          />
          {confirm && password !== confirm && (
            <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !isPasswordStrong(password) || password !== confirm}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm"
        >
          {loading ? "Guardando..." : "Establecer nueva contraseña →"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col">
      <nav className="flex items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="Vetria" width={32} height={32} className="rounded-lg shadow-md" />
          <span className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors">Vetria</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
            <Suspense fallback={<p className="text-slate-400 text-sm text-center">Cargando...</p>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
