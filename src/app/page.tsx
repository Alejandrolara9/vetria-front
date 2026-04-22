"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TYPING_TEXTS = [
  "Perro 3 años, vomitando 2 días, temperatura 39.5°C",
  "Gata castrada, pérdida de peso progresiva, polidipsia",
  "Labrador 5 años, cojera en pata trasera derecha post-ejercicio",
  "Cachorro 4 meses, primera consulta, esquema vacunal incompleto",
];

const FEATURES = [
  {
    icon: "✨",
    title: "Historia clínica con IA",
    desc: "Escribe dos frases. La IA genera la historia completa con terminología clínica precisa en menos de 5 segundos.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    badge: "Exclusivo",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    icon: "📅",
    title: "Agenda inteligente",
    desc: "Gestiona citas, detecta conflictos de horario y confirma disponibilidad por veterinario en tiempo real.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    badge: null,
    badgeColor: "",
  },
  {
    icon: "🔔",
    title: "Recordatorios automáticos",
    desc: "El sistema calcula cuándo vence cada vacuna y envía el recordatorio en el canal y momento exactos.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    badge: "IA",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: "🐾",
    title: "Expediente digital completo",
    desc: "Todo el historial de cada paciente: citas, vacunas, eventos clínicos, historias y recordatorios en un solo lugar.",
    color: "bg-green-50 text-green-600 border-green-100",
    badge: null,
    badgeColor: "",
  },
  {
    icon: "📊",
    title: "Reportes en tiempo real",
    desc: "Métricas actualizadas al instante: ingresos, pacientes atendidos, adherencia a protocolos de vacunación.",
    color: "bg-rose-50 text-rose-600 border-rose-100",
    badge: null,
    badgeColor: "",
  },
  {
    icon: "🔒",
    title: "Multi-tenant seguro",
    desc: "Cada clínica en su propio espacio completamente aislado. Tus datos nunca se mezclan con los de otras clínicas.",
    color: "bg-slate-50 text-slate-600 border-slate-100",
    badge: null,
    badgeColor: "",
  },
];

const STATS = [
  { value: "< 5s", label: "Generación de historia IA" },
  { value: "100%", label: "Multi-tenant aislado" },
  { value: "4+", label: "Módulos integrados" },
  { value: "24/7", label: "Disponibilidad del sistema" },
];

const TESTIMONIALS = [
  {
    quote: "Antes me tomaba 15 minutos escribir una historia clínica completa. Ahora dicto dos frases y en 4 segundos está lista para revisar. Es increíble.",
    name: "Dra. Carolina Méndez",
    role: "Médica veterinaria · Bogotá",
    avatar: "CM",
    color: "bg-blue-500",
  },
  {
    quote: "Los recordatorios automáticos de vacunación nos hicieron recuperar clientes que teníamos perdidos. El primer mes aumentamos las consultas un 30%.",
    name: "Dr. Andrés Ospina",
    role: "Director clínica · Medellín",
    avatar: "AO",
    color: "bg-green-500",
  },
  {
    quote: "La seguridad multi-tenant nos dio tranquilidad total. Somos tres sedes y los datos de cada una están perfectamente separados.",
    name: "Dra. Luisa Vargas",
    role: "Propietaria · Red de clínicas",
    avatar: "LV",
    color: "bg-purple-500",
  },
];

const PLAN_FREE = [
  "Hasta 50 pacientes activos",
  "Historia clínica con IA (10/mes)",
  "Agenda básica",
  "Recordatorios automáticos",
  "Expediente digital",
  "Soporte por email",
];

const PLAN_PRO = [
  "Pacientes ilimitados",
  "Historia clínica con IA ilimitada",
  "Agenda multi-veterinario",
  "Recordatorios con canal óptimo por cliente",
  "Reportes avanzados",
  "Inventario y facturación",
  "Soporte prioritario 24/7",
  "API para integraciones",
];

export default function LandingPage() {
  const [typingIndex, setTypingIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const currentText = TYPING_TEXTS[typingIndex];
    const speed = isDeleting ? 25 : 55;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        } else {
          setShowGenerated(true);
          setTimeout(() => {
            setIsDeleting(true);
            setShowGenerated(false);
          }, 3000);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        } else {
          setIsDeleting(false);
          setTypingIndex((i) => (i + 1) % TYPING_TEXTS.length);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, typingIndex]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>

      {/* ──────────────── NAVBAR ──────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>Vetria</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["#funciones", "#ia", "#precios"].map((href, i) => (
              <a key={href} href={href}
                className={`text-sm font-medium transition-colors hover:text-blue-400 ${scrolled ? "text-gray-600" : "text-white/80"}`}>
                {["Funciones", "IA", "Precios"][i]}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className={`text-sm font-medium transition-colors hidden sm:block ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"}`}>
              Iniciar sesión
            </Link>
            <Link href="/register"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-blue-600/30">
              Prueba gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ──────────────── HERO ──────────────── */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
        {/* Blobs decorativos */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-blue-800/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 border border-blue-400/25 rounded-full text-blue-300 text-xs font-semibold mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" style={{ animation: "pulse 2s infinite" }} />
              Inteligencia Artificial integrada de forma nativa
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-[3.75rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              El software que
              <br />
              <span style={{ background: "linear-gradient(90deg, #60a5fa, #38bdf8, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                trabaja contigo,
              </span>
              <br />
              no al revés.
            </h1>

            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-lg">
              Historias clínicas que se generan en segundos. Recordatorios que salen solos. Agenda sin conflictos.
              Todo lo que tu clínica necesita — potenciado con IA.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/register"
                className="px-7 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all text-center shadow-xl shadow-blue-500/30 text-sm">
                Empieza gratis ahora →
              </Link>
              <a href="#ia"
                className="px-7 py-4 border border-white/15 text-white rounded-xl hover:bg-white/10 transition-all text-center font-medium text-sm">
                Ver la IA en acción
              </a>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Sin tarjeta de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                30 días de prueba gratis
              </span>
            </div>
          </div>

          {/* Mockup de IA */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl scale-95" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
              {/* Barra de ventana */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-950/80 border-b border-slate-700/60">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex items-center gap-1.5 ml-3">
                  <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Vetria · Historia clínica IA</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Input del vet */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-[9px] text-slate-300 font-bold">Dr</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Nota del veterinario</p>
                  </div>
                  <div className="bg-slate-800 rounded-xl px-4 py-3 border border-slate-700/60 min-h-[52px]">
                    <span className="text-sm text-slate-200 font-mono">{displayText}</span>
                    <span className="text-blue-400 font-mono" style={{ animation: "pulse 1s infinite" }}>|</span>
                  </div>
                </div>

                {/* Historia generada */}
                <div className={`transition-all duration-700 ${showGenerated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-[9px] text-white font-bold">IA</span>
                    </div>
                    <p className="text-xs text-purple-400 font-semibold">Historia generada · 3.4s</p>
                    <span className="ml-auto text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">Listo para revisar</span>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-purple-500/20 space-y-2.5 text-xs text-slate-300 leading-relaxed">
                    <div>
                      <span className="text-blue-400 font-semibold">Anamnesis: </span>
                      Paciente canino de 3 años de edad que consulta por cuadro emético de 48 horas de evolución con hiporexia marcada. Propietaria refiere 4-5 episodios de vómito diarios...
                    </div>
                    <div>
                      <span className="text-blue-400 font-semibold">Examen físico: </span>
                      T°: 39.5°C (febricular leve). Mucosas rosadas, TLC 2s. Hidratación: 5% deshidratación estimada. Abdomen tenso a la palpación profunda...
                    </div>
                    <div>
                      <span className="text-blue-400 font-semibold">Plan terapéutico: </span>
                      Fluidoterapia IV: Lactato de Ringer 50 mL/kg/día. Metronidazol 25 mg/kg BID IV. Ayuno 12h, luego dieta blanda...
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 transition-colors">
                      ✓ Aprobar historia
                    </button>
                    <button className="px-3 py-2 border border-slate-600 text-slate-400 text-xs rounded-lg hover:bg-slate-700 transition-colors">
                      Editar
                    </button>
                  </div>
                </div>

                {!showGenerated && (
                  <div className="space-y-2 opacity-40">
                    <div className="h-2.5 bg-slate-700 rounded-full w-full" style={{ animation: "pulse 2s infinite" }} />
                    <div className="h-2.5 bg-slate-700 rounded-full w-4/5" style={{ animation: "pulse 2s infinite 0.2s" }} />
                    <div className="h-2.5 bg-slate-700 rounded-full w-2/3" style={{ animation: "pulse 2s infinite 0.4s" }} />
                  </div>
                )}
              </div>
            </div>

            {/* Floating chips */}
            <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-gray-100">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-lg">⚡</div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-none">3.4 segundos</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Historia completa</p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-gray-100">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg">✅</div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-none">Sin digitación</p>
                <p className="text-[10px] text-gray-400 mt-0.5">El vet solo revisa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-500">
          <span className="text-xs">Descubre más</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ──────────────── STATS ──────────────── */}
      <section className="bg-blue-600 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-sm text-blue-200 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── FEATURES ──────────────── */}
      <section id="funciones" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              Todo lo que necesitas
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Una plataforma. Todo resuelto.</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Desde la primera consulta hasta el seguimiento post-vacuna. Vetria cubre cada paso del flujo de tu clínica veterinaria.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${f.color}`}>
                    {f.icon}
                  </div>
                  {f.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${f.badgeColor}`}>
                      {f.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-[15px]">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── IA SECTION ──────────────── */}
      <section id="ia" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                IA generativa
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                De nota breve a historia{" "}
                <span style={{ background: "linear-gradient(90deg, #7c3aed, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  clínica completa.
                </span>
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                El veterinario escribe una nota rápida de 10 palabras. La IA de Vetria genera en segundos una historia clínica estructurada con anamnesis, examen físico, diagnóstico diferencial y plan terapéutico — con terminología clínica precisa lista para firmar.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: "⚡", text: "Primer token en menos de 2 segundos — ves el texto aparecer en tiempo real" },
                  { icon: "🔬", text: "Terminología clínica veterinaria correcta según especie, raza y edad del paciente" },
                  { icon: "✏️", text: "El veterinario revisa y ajusta antes de aprobar — la IA es un asistente, no un reemplazo" },
                  { icon: "📁", text: "Historia aprobada queda vinculada automáticamente al expediente de la mascota" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 text-sm">
                Prueba la IA gratis
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Visual comparison */}
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sin Vetria — digitación manual</span>
                </div>
                <div className="space-y-2">
                  {["Anamnesis (4 min)...", "Examen físico (3 min)...", "Diagnóstico diferencial (3 min)...", "Plan terapéutico (5 min)..."].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="h-4 bg-gray-200 rounded flex-1" />
                      <span className="text-xs text-gray-400 w-16 flex-shrink-0">{t.split("(")[1]?.replace(")", "") ?? ""}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Tiempo total promedio</span>
                  <span className="text-sm font-bold text-red-500">~15 minutos</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-950 to-purple-950 border border-blue-700/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full" style={{ animation: "pulse 2s infinite" }} />
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Con Vetria IA</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Nota breve del vet", time: "30s", color: "bg-blue-700/50" },
                    { label: "Generación IA (streaming)", time: "4s", color: "bg-purple-700/50" },
                    { label: "Revisión y ajuste", time: "1 min", color: "bg-blue-700/50" },
                    { label: "Firma y archivo automático", time: "2s", color: "bg-green-700/50" },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-2">
                      <div className={`h-4 ${t.color} rounded flex-1 flex items-center px-2`}>
                        <span className="text-[10px] text-white/70">{t.label}</span>
                      </div>
                      <span className="text-xs text-blue-300 w-12 flex-shrink-0 text-right">{t.time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-blue-700/30 flex items-center justify-between">
                  <span className="text-xs text-blue-400">Tiempo total</span>
                  <span className="text-sm font-bold text-green-400">~2 minutos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── TESTIMONIALS ──────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Lo que dicen los veterinarios</h2>
            <p className="text-gray-500">Clínicas que ya transformaron su forma de trabajar</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── PRICING ──────────────── */}
      <section id="precios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              Precios
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">30 días gratis. Luego crece sin límites.</h2>
            <p className="text-gray-500 text-lg">Sin sorpresas. Cancela cuando quieras.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free trial */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition-colors">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Prueba gratuita</h3>
                <p className="text-gray-500 text-sm mb-4">30 días para explorar todo sin límites</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-extrabold text-gray-900">$0</span>
                  <span className="text-gray-400 mb-2">/ 30 días</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {PLAN_FREE.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className="block text-center py-3.5 border-2 border-gray-900 text-gray-900 font-bold rounded-xl hover:bg-gray-900 hover:text-white transition-all text-sm">
                Empezar prueba gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="relative border-2 border-blue-600 rounded-2xl p-8 bg-gradient-to-br from-blue-600 to-blue-700 shadow-2xl shadow-blue-500/30 overflow-hidden">
              <div className="absolute top-5 right-5 bg-amber-400 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                Más popular
              </div>
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
              <div className="relative mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                <p className="text-blue-200 text-sm mb-4">Para clínicas que quieren crecer sin límites</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-extrabold text-white">$49</span>
                  <span className="text-blue-200 mb-2">/mes</span>
                </div>
              </div>
              <ul className="relative space-y-3 mb-8">
                {PLAN_PRO.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-white">
                    <svg className="w-4 h-4 text-blue-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className="relative block text-center py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all text-sm shadow-lg">
                Empezar con Pro →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── CTA FINAL ──────────────── */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="text-5xl mb-6">🐾</div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Tu clínica merece tecnología<br />
            <span style={{ background: "linear-gradient(90deg, #60a5fa, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              de nivel enterprise.
            </span>
          </h2>
          <p className="text-slate-300 text-lg mb-10 leading-relaxed">
            Únete a las clínicas veterinarias que ya están ahorrando horas cada día con IA. Configura tu clínica en menos de 15 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/30 text-sm">
              Crear cuenta gratis — sin tarjeta
            </Link>
            <Link href="/login"
              className="px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all font-medium text-sm">
              Ya tengo cuenta →
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer className="bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="font-bold text-white text-lg">Vetria</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                El software veterinario con IA más avanzado de Latinoamérica. Construido para que el veterinario se concentre en lo que importa: los pacientes.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Producto</p>
              <ul className="space-y-2.5">
                {["Funciones", "Precios", "Seguridad", "Actualizaciones"].map((l) => (
                  <li key={l}><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Empresa</p>
              <ul className="space-y-2.5">
                {["Acerca de", "Blog", "Contacto", "Términos"].map((l) => (
                  <li key={l}><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">© 2026 Vetria. Todos los derechos reservados.</p>
            <p className="text-slate-600 text-xs">Hecho con ❤️ para los veterinarios de Latinoamérica</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
