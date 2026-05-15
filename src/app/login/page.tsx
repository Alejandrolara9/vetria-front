"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/google", { credential: credentialResponse.credential });
      if (response.data.isNew) {
        router.push("/register");
        return;
      }
      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg === "CLINIC_NAME_REQUIRED") {
        router.push("/register");
        return;
      }
      setError(msg ?? "Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-teal-950 to-slate-900 flex flex-col">

      {/* Navbar mínimo */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="Vetria" width={32} height={32} className="rounded-lg shadow-md" />
          <span className="font-bold text-white text-lg group-hover:text-teal-300 transition-colors">Vetria</span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>
      </nav>

      {/* Contenido centrado */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-white mb-1">Bienvenido de vuelta</h1>
              <p className="text-slate-400 text-sm">Ingresa a tu clínica veterinaria</p>
            </div>

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
                  placeholder="vet@miclinica.com"
                  required
                  className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:bg-white/10 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <Link href="/forgot-password" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-600/30 text-sm mt-2"
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
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Error al iniciar sesión con Google")}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  width="368"
                  text="signin_with"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-slate-400 text-sm">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">
                  Crear cuenta gratis
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            Al ingresar aceptas nuestros{" "}
            <a href="#" className="text-slate-500 hover:text-slate-400 underline">Términos de uso</a>
          </p>
        </div>
      </div>
    </div>
  );
}
