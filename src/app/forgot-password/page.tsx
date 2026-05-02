"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors">Vetria</span>
        </Link>
        <Link href="/login" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio de sesión
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white">Revisa tu correo</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Si el correo <span className="text-white font-medium">{email}</span> está registrado, recibirás un enlace para restablecer tu contraseña. El enlace expira en 1 hora.
                </p>
                <p className="text-slate-500 text-xs">¿No lo ves? Revisa la carpeta de spam.</p>
                <Link
                  href="/login"
                  className="inline-block mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-extrabold text-white mb-1">¿Olvidaste tu contraseña?</h1>
                  <p className="text-slate-400 text-sm">Ingresa tu correo y te enviaremos un enlace para restablecerla</p>
                </div>

                {error && (
                  <div className="mb-5 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="vet@miclinica.com"
                      required
                      className="w-full px-4 py-3 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm"
                  >
                    {loading ? "Enviando..." : "Enviar enlace de recuperación →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
