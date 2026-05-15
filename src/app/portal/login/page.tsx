"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { ownerLogin, ownerGoogleAuth, saveOwnerToken } from "@/services/owner-portal";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await ownerLogin({ email, password });
      saveOwnerToken(res.token);
      router.push("/portal/pets");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Correo o contraseña incorrectos";
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setError("");
    setLoading(true);
    try {
      const res = await ownerGoogleAuth(credentialResponse.credential);
      saveOwnerToken(res.token);
      router.push("/portal/pets");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión con Google";
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-6 py-12 min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 relative mx-auto mb-4">
            <Image src="/logo.png" alt="Vetria" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Portal de Mascotas</h1>
          <p className="text-slate-400 text-sm">Consulta el historial de salud de tus mascotas</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold rounded-xl transition-all text-sm mt-2"
            >
              {loading ? "Ingresando..." : "Iniciar sesión →"}
            </button>
          </form>

          <div className="mt-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500">o continúa con</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setError("Error al iniciar sesión con Google")}
                theme="filled_black"
                shape="rectangular"
                size="large"
                width="368"
                text="signin_with"
              />
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          ¿No tienes acceso? Pide a tu veterinaria que te invite.
        </p>
      </div>
    </div>
  );
}
