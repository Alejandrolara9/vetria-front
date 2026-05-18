"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ResponsiveGoogleLogin from "@/components/ResponsiveGoogleLogin";
import { api } from "@/services/api";
import PasswordStrengthChecklist, { isPasswordStrong } from "@/components/PasswordStrengthChecklist";
import SearchableSelect from "@/components/SearchableSelect";
import { COLOMBIA_DEPARTMENTS, getCitiesByDepartment } from "@/lib/colombia-locations";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Google SSO — paso intermedio
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);
  const [googleClinicName, setGoogleClinicName] = useState("");
  const [googleDepartment, setGoogleDepartment] = useState("");
  const [googleCity, setGoogleCity] = useState("");

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setError("");
    setPendingCredential(credentialResponse.credential);
  };

  const handleGoogleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingCredential || !googleClinicName.trim()) return;
    setLoading(true);
    try {
      const response = await api.post("/auth/google", {
        credential: pendingCredential,
        clinicName: googleClinicName.trim(),
        ...(googleDepartment ? { clinicDepartment: googleDepartment } : {}),
        ...(googleCity ? { clinicCity: googleCity } : {}),
      });
      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Error al registrarse con Google");
      setPendingCredential(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        tenantName,
        ...(department ? { clinicDepartment: department } : {}),
        ...(city ? { clinicCity: city } : {}),
      });
      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  if (pendingCredential) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Un último paso</h2>
            <p className="text-slate-400 text-sm mt-1">Cuéntanos sobre tu clínica veterinaria</p>
          </div>
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleGoogleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre de la clínica *"
              required
              autoFocus
              value={googleClinicName}
              onChange={(e) => setGoogleClinicName(e.target.value)}
              className="w-full px-4 py-3 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />

            <SearchableSelect
              options={COLOMBIA_DEPARTMENTS.map((d) => d.name)}
              value={googleDepartment}
              onChange={(v) => { setGoogleDepartment(v); setGoogleCity(""); }}
              placeholder="Departamento (opcional)"
              variant="dark"
            />

            <SearchableSelect
              options={getCitiesByDepartment(googleDepartment)}
              value={googleCity}
              onChange={setGoogleCity}
              placeholder="Ciudad / Municipio (opcional)"
              disabled={!googleDepartment}
              variant="dark"
            />

            <button
              type="submit"
              disabled={loading || !googleClinicName.trim()}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm"
            >
              {loading ? "Creando tu clínica..." : "Continuar →"}
            </button>
            <button
              type="button"
              onClick={() => { setPendingCredential(null); setError(""); }}
              className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              ← Volver
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col">

      {/* Navbar mínimo */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="Vetria" width={32} height={32} className="rounded-lg shadow-md" />
          <span className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors">Vetria</span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 border border-blue-400/25 rounded-full text-blue-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              7 días de prueba gratis · Sin tarjeta de crédito
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-white mb-1">Crea tu clínica</h1>
              <p className="text-slate-400 text-sm">Configúrate en menos de 2 minutos</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tu nombre
                </label>
                <input
                  type="text"
                  placeholder="Dr. Juan Pérez"
                  required
                  className="w-full px-4 py-3 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nombre de la clínica
                </label>
                <input
                  type="text"
                  placeholder="Clínica Veterinaria Los Andes"
                  required
                  className="w-full px-4 py-3 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                />
              </div>

              {/* Ubicación */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Departamento
                  </label>
                  <SearchableSelect
                    options={COLOMBIA_DEPARTMENTS.map((d) => d.name)}
                    value={department}
                    onChange={(v) => { setDepartment(v); setCity(""); }}
                    placeholder="Buscar..."
                    variant="dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Ciudad
                  </label>
                  <SearchableSelect
                    options={getCitiesByDepartment(department)}
                    value={city}
                    onChange={setCity}
                    placeholder="Buscar..."
                    disabled={!department}
                    variant="dark"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Contraseña
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

              <button
                type="submit"
                disabled={loading || !isPasswordStrong(password)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm mt-2"
              >
                {loading ? "Creando tu clínica..." : "Crear cuenta gratis →"}
              </button>
            </form>

            <div className="mt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-500">o regístrate con</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <ResponsiveGoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Error al registrarse con Google")}
                text="signup_with"
              />
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-slate-400 text-sm">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-6">
            {["7 días gratis", "Cancela cuando quieras", "Datos seguros"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-slate-500 text-xs">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
