"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { submitFeedback } from "@/services/superadmin.service";

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
    desc: "Escribe dos frases o dicta en voz. La IA genera la historia completa con terminología clínica precisa en menos de 5 segundos.",
    gradient: "from-teal-500 to-emerald-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
    badge: "IA",
    badgeColor: "bg-teal-100 text-teal-700",
  },
  {
    icon: "🎙️",
    title: "Dictado por voz",
    desc: "Dicta la nota del paciente con tu voz directamente en la app. Sin costo adicional — usa el micrófono del navegador.",
    gradient: "from-rose-500 to-orange-500",
    bg: "bg-rose-50",
    border: "border-rose-100",
    badge: "Nuevo",
    badgeColor: "bg-rose-100 text-rose-700",
  },
  {
    icon: "📅",
    title: "Agenda inteligente",
    desc: "Gestión de citas por veterinario, detección de conflictos y confirmación automática. Invitaciones al calendario de Google, Outlook y Apple.",
    gradient: "from-cyan-500 to-teal-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    badge: null,
    badgeColor: "",
  },
  {
    icon: "🔔",
    title: "Recordatorios automáticos",
    desc: "El sistema calcula cuándo vence cada vacuna o desparasitación y envía el recordatorio en el canal exacto al cliente.",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    badge: "IA",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: "🔬",
    title: "Análisis de imágenes y labs",
    desc: "Adjunta radiografías, ecografías o resultados de laboratorio. La IA los analiza e incluye los hallazgos en la historia clínica automáticamente.",
    gradient: "from-teal-500 to-emerald-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
    badge: "IA",
    badgeColor: "bg-teal-100 text-teal-700",
  },
  {
    icon: "🐾",
    title: "Expediente digital completo",
    desc: "Todo el historial del paciente: citas, vacunas, eventos clínicos, historias, adjuntos y recordatorios en un solo lugar.",
    gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    border: "border-green-100",
    badge: null,
    badgeColor: "",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Registra tu clínica",
    desc: "Configura tu clínica en menos de 5 minutos. Agrega tu equipo, protocolos y datos de la veterinaria.",
    color: "text-teal-600",
    border: "border-teal-200",
    bg: "bg-teal-50",
    icon: "🏥",
  },
  {
    num: "02",
    title: "Dicta o escribe en segundos",
    desc: "El veterinario dicta con voz o escribe una nota breve durante la consulta. Nada más.",
    color: "text-purple-600",
    border: "border-purple-200",
    bg: "bg-purple-50",
    icon: "🎙️",
  },
  {
    num: "03",
    title: "La IA hace el resto",
    desc: "Historia clínica lista en 4 segundos, recordatorios programados automáticamente, agenda sin conflictos y reportes en tiempo real.",
    color: "text-emerald-600",
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    icon: "✨",
  },
];

const TESTIMONIALS = [
  {
    quote: "Antes me tomaba 15 minutos escribir una historia clínica completa. Ahora dicto dos frases y en 4 segundos está lista para revisar. Es increíble.",
    name: "Dra. Carolina Méndez",
    role: "Médica veterinaria · Bogotá",
    avatar: "CM",
    emoji: "🐕",
    color: "bg-blue-500",
    highlight: "15 min → 4 seg",
  },
  {
    quote: "Los recordatorios automáticos de vacunación nos hicieron recuperar clientes que teníamos perdidos. El primer mes aumentamos las consultas un 30%.",
    name: "Dr. Andrés Ospina",
    role: "Director clínica · Medellín",
    avatar: "AO",
    emoji: "🐈",
    color: "bg-green-500",
    highlight: "+30% consultas",
  },
  {
    quote: "La invitación de calendario que llega al email del cliente cuando agenda una cita es un detalle que marca la diferencia. Parece un software de primera categoría.",
    name: "Dra. Luisa Vargas",
    role: "Propietaria · Cali",
    avatar: "LV",
    emoji: "🐇",
    color: "bg-purple-500",
    highlight: "Clientes felices",
  },
];

const PLAN_TRIAL = [
  "7 días gratis · sin cobro los primeros 7 días",
  "100 créditos IA incluidos",
  "Todas las funciones del plan BASIC",
  "Hasta 8 usuarios",
  "Hasta 1.000 mascotas",
  "Historia clínica con IA",
  "Dictado por voz",
  "Agenda con invitación de calendario",
  "Soporte por email",
];

const PLAN_BASIC = [
  "100 créditos IA / mes",
  "Hasta 8 usuarios",
  "Hasta 1.000 mascotas",
  "Historia clínica con IA",
  "Dictado por voz",
  "Análisis de imágenes y labs con IA",
  "Agenda + invitaciones al calendario",
  "Recordatorios automáticos",
  "Portal del dueño de mascota",
];

const FAQS = [
  {
    q: "¿Necesito instalar algo?",
    a: "No. Vetria es 100% web. Funciona en cualquier navegador moderno desde computador, tablet o celular. Sin descargas, sin configuraciones.",
  },
  {
    q: "¿Mis datos y los de mis clientes son seguros?",
    a: "Sí. Todo el tráfico viaja cifrado con HTTPS, los datos se almacenan en AWS con cifrado en reposo y backups automáticos diarios. Tu información nunca se comparte con terceros.",
  },
  {
    q: "¿Qué pasa cuando terminan los 7 días de prueba?",
    a: "Te avisamos con anticipación. Si decides continuar, activas el plan BASIC. Si no, tus datos se conservan 30 días adicionales para que puedas exportarlos.",
  },
  {
    q: "¿Cuántos usuarios puedo agregar a mi clínica?",
    a: "Hasta 8 usuarios con el plan BASIC — veterinarios, recepcionistas y asistentes, cada uno con roles y permisos personalizados.",
  },
  {
    q: "¿Los créditos IA no usados se acumulan?",
    a: "Los créditos del plan se renuevan cada mes y no se acumulan. Sin embargo, los créditos que compras por separado no vencen y puedes usarlos cuando quieras.",
  },
  {
    q: "¿Funciona con cualquier especialidad veterinaria?",
    a: "Sí. La IA está entrenada para medicina general, exóticos, animales de granja y especialidades. Puedes personalizar los protocolos para tu tipo de clínica.",
  },
];

export default function LandingPage() {
  const [typingIndex, setTypingIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [fbName, setFbName] = useState("");
  const [fbEmail, setFbEmail] = useState("");
  const [fbMessage, setFbMessage] = useState("");
  const [fbRating, setFbRating] = useState(5);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbSent, setFbSent] = useState(false);
  const [fbError, setFbError] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
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
          }, 3200);
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

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFbError("");
    setFbLoading(true);
    try {
      await submitFeedback({ name: fbName, email: fbEmail || undefined, message: fbMessage, rating: fbRating });
      setFbSent(true);
      setFbName("");
      setFbEmail("");
      setFbMessage("");
      setFbRating(5);
    } catch (err) {
      setFbError(err instanceof Error ? err.message : "Error al enviar. Intenta de nuevo.");
    } finally {
      setFbLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Vetria" width={32} height={32} className="rounded-lg shadow-md shadow-teal-600/40" />
            <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>Vetria</span>
            <span className={`hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${scrolled ? "bg-teal-100 text-teal-700" : "bg-teal-500/30 text-teal-200"}`}>Colombia</span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            {[["#funciones", "Funciones"], ["#como-funciona", "Cómo funciona"], ["#ia", "IA"], ["#precios", "Precios"]].map(([href, label]) => (
              <a key={href} href={href} className={`text-sm font-medium transition-colors hover:text-teal-400 ${scrolled ? "text-gray-600" : "text-white/80"}`}>{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className={`text-sm font-medium transition-colors hidden sm:block ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"}`}>
              Iniciar sesión
            </Link>
            <Link href="/register" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-teal-600/30">
              Prueba gratis →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-950 via-teal-950 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-blue-800/8 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/15 border border-teal-400/25 rounded-full text-teal-300 text-xs font-semibold backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                Inteligencia Artificial nativa
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/15 border border-green-400/20 rounded-full text-green-300 text-xs font-medium">
                🇨🇴 Hecho para Colombia
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-[3.5rem] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
              El veterinario que<br />
              <span style={{ background: "linear-gradient(90deg, #2dd4bf, #34d399, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                usa IA trabaja 10×
              </span><br />
              más rápido.
            </h1>

            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-lg">
              Historia clínica completa en 4 segundos. Recordatorios que salen solos. Agenda sin conflictos.
              Diseñado para clínicas veterinarias colombianas.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/register" className="px-7 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all text-center shadow-xl shadow-teal-600/30 text-sm">
                Empieza gratis — 7 días →
              </Link>
              <a href="#ia" className="px-7 py-4 border border-white/15 text-white rounded-xl hover:bg-white/8 transition-all text-center font-medium text-sm">
                Ver la IA en acción
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
              {["Sin cobro los primeros 7 días", "7 días gratis", "Configura en 5 min"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl scale-95 pointer-events-none" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-950/80 border-b border-slate-700/60">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
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
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-[9px] text-slate-300 font-bold">Dr</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Nota del veterinario</p>
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-rose-400">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                      Dictando...
                    </span>
                  </div>
                  <div className="bg-slate-800 rounded-xl px-4 py-3 border border-slate-700/60 min-h-[52px]">
                    <span className="text-sm text-slate-200 font-mono">{displayText}</span>
                    <span className="text-teal-400 font-mono animate-pulse">|</span>
                  </div>
                </div>

                <div className={`transition-all duration-700 ${showGenerated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-[9px] text-white font-bold">IA</span>
                    </div>
                    <p className="text-xs text-teal-400 font-semibold">Historia generada · 3.8s</p>
                    <span className="ml-auto text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium border border-green-500/20">
                      Lista para revisar
                    </span>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-teal-500/20 space-y-2.5 text-xs text-slate-300 leading-relaxed">
                    <div>
                      <span className="text-teal-400 font-semibold">Anamnesis: </span>
                      Paciente canino de 3 años que consulta por cuadro emético de 48 horas de evolución con hiporexia marcada...
                    </div>
                    <div>
                      <span className="text-teal-400 font-semibold">Examen físico: </span>
                      T°: 39.5°C (febricular leve). Mucosas rosadas, TLC 2s. Hidratación: 5% deshidratación estimada...
                    </div>
                    <div>
                      <span className="text-teal-400 font-semibold">Plan: </span>
                      Fluidoterapia IV LR 50 mL/kg/día. Metronidazol 25 mg/kg BID IV. Ayuno 12h, dieta blanda...
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-500 transition-colors">
                      ✓ Aprobar historia
                    </button>
                    <button className="px-3 py-2 border border-slate-600 text-slate-400 text-xs rounded-lg hover:bg-slate-700 transition-colors">
                      Editar
                    </button>
                  </div>
                </div>

                {!showGenerated && (
                  <div className="space-y-2 opacity-40">
                    <div className="h-2.5 bg-slate-700 rounded-full w-full animate-pulse" />
                    <div className="h-2.5 bg-slate-700 rounded-full w-4/5 animate-pulse [animation-delay:200ms]" />
                    <div className="h-2.5 bg-slate-700 rounded-full w-2/3 animate-pulse [animation-delay:400ms]" />
                  </div>
                )}
              </div>
            </div>

            <div className="absolute -top-4 -right-4 hidden sm:flex bg-white rounded-2xl shadow-xl px-3.5 py-2.5 items-center gap-2.5 border border-gray-100">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-lg">⚡</div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-none">3.8 segundos</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Historia completa</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden sm:flex bg-white rounded-2xl shadow-xl px-3.5 py-2.5 items-center gap-2.5 border border-gray-100">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg">🎙️</div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-none">Dictado por voz</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Sin costo adicional</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-500">
          <span className="text-xs">Descubre más</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gradient-to-r from-teal-700 to-emerald-600 py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "< 5s", label: "Historia clínica IA" },
              { value: "7 días", label: "Prueba gratuita" },
              { value: "10+", label: "Módulos integrados" },
              { value: "100%", label: "Multi-tenant seguro" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-sm text-blue-200 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funciones" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              Sin fricciones
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Agenda, historia clínica y recordatorios — sin pegar un software con otro.</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              En la mayoría de clínicas la agenda va por un lado, las historias por otro y los recordatorios nunca llegan. Vetria une todo: el veterinario dicta, la IA genera la historia en 4 segundos, el sistema programa la próxima vacuna solo y el tutor la recibe en su celular.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className={`bg-white rounded-2xl p-6 border ${f.border} hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${f.bg} border border-gray-100 group-hover:scale-110 transition-transform duration-300`}>
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

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              Simple de usar
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">En marcha en 5 minutos.</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Sin instalaciones. Sin capacitaciones largas. Solo abres el navegador y empiezas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200" />
            {STEPS.map((s) => (
              <div key={s.num} className="relative text-center group">
                <div className={`w-20 h-20 mx-auto rounded-2xl ${s.bg} border-2 ${s.border} flex flex-col items-center justify-center mb-6 relative z-10 group-hover:scale-105 transition-transform duration-300`}>
                  <span className="text-2xl mb-0.5">{s.icon}</span>
                  <span className={`text-xs font-black ${s.color}`}>{s.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IA SECTION ── */}
      <section id="ia" className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                IA Generativa
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                De nota breve a historia{" "}
                <span style={{ background: "linear-gradient(90deg, #0d9488, #059669)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  clínica completa.
                </span>
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                El veterinario dicta o escribe una nota rápida. Vetria genera en segundos una historia clínica estructurada
                con anamnesis, examen físico, diagnóstico diferencial y plan terapéutico — con terminología clínica precisa lista para aprobar.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: "⚡", text: "Streaming en tiempo real — ves el texto aparecer en menos de 2 segundos" },
                  { icon: "🎙️", text: "Dictado por voz con el micrófono del navegador, sin costo extra" },
                  { icon: "🔬", text: "Adjunta labs y radiografías: la IA los analiza e integra a la historia" },
                  { icon: "✏️", text: "El veterinario revisa y ajusta antes de aprobar — la IA es asistente, no reemplazo" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors">
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-teal-500/25 text-sm">
                Prueba la IA gratis — 7 días
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sin Vetria — digitación manual</span>
                </div>
                <div className="space-y-2">
                  {["Anamnesis · 4 min", "Examen físico · 3 min", "Diagnóstico diferencial · 3 min", "Plan terapéutico · 5 min"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="h-4 bg-gray-100 rounded flex-1" />
                      <span className="text-xs text-gray-400 w-24 flex-shrink-0 text-right">{t.split(" · ")[1]}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Tiempo total promedio</span>
                  <span className="text-sm font-bold text-red-500">~15 minutos</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-950 to-slate-900 border border-teal-700/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-teal-300 uppercase tracking-wide">Con Vetria IA</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Nota breve / dictado", time: "30s", color: "bg-blue-700/50" },
                    { label: "Generación IA (streaming)", time: "4s", color: "bg-purple-700/60" },
                    { label: "Revisión y ajuste", time: "1 min", color: "bg-blue-700/50" },
                    { label: "Firma y archivo", time: "2s", color: "bg-green-700/50" },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-2">
                      <div className={`h-4 ${t.color} rounded flex-1 flex items-center px-2`}>
                        <span className="text-[10px] text-white/70">{t.label}</span>
                      </div>
                      <span className="text-xs text-blue-300 w-12 flex-shrink-0 text-right">{t.time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-teal-700/30 flex items-center justify-between">
                  <span className="text-xs text-teal-400">Tiempo total</span>
                  <span className="text-sm font-bold text-green-400">~2 minutos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              Historias reales
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Lo que dicen los veterinarios</h2>
            <p className="text-gray-500">Clínicas que ya transformaron su forma de trabajar</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-700 rounded-full">{t.highlight}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center flex-shrink-0 text-lg`}>
                    {t.emoji}
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

      {/* ── FEEDBACK FORM ── */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="max-w-2xl mx-auto px-5">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              Tu opinión importa
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">¿Qué piensas de Vetria?</h2>
            <p className="text-gray-500 text-sm">Cuéntanos tu experiencia — cada opinión nos ayuda a mejorar.</p>
          </div>

          {fbSent ? (
            <div className="bg-white rounded-2xl border border-green-200 p-10 text-center shadow-sm">
              <div className="text-5xl mb-4">🐾</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¡Gracias por tu opinión!</h3>
              <p className="text-gray-500 text-sm mb-5">Tu feedback ha sido enviado. Nos ayuda a seguir mejorando Vetria.</p>
              <button
                onClick={() => setFbSent(false)}
                className="text-sm text-teal-600 hover:text-teal-500 font-medium transition-colors"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm space-y-5">
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tu calificación</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFbRating(star)}
                      className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                    >
                      <span className={star <= fbRating ? "text-amber-400" : "text-gray-200"}>★</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={fbName}
                  onChange={(e) => setFbName(e.target.value)}
                  placeholder="Dr. Carlos López"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input
                  type="email"
                  value={fbEmail}
                  onChange={(e) => setFbEmail(e.target.value)}
                  placeholder="doctor@clinica.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tu opinión <span className="text-red-500">*</span></label>
                <textarea
                  value={fbMessage}
                  onChange={(e) => setFbMessage(e.target.value)}
                  placeholder="Cuéntanos qué te parece Vetria, qué mejorarías o qué te ha gustado más..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all resize-none"
                />
              </div>

              {fbError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{fbError}</p>
              )}

              <button
                type="submit"
                disabled={fbLoading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm shadow-md shadow-teal-600/20"
              >
                {fbLoading ? "Enviando..." : "Enviar opinión →"}
              </button>

              <p className="text-center text-xs text-gray-400">Tu opinión es anónima si no dejas tu email.</p>
            </form>
          )}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precios" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              Precios en COP
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">7 días gratis. Luego crece sin límites.</h2>
            <p className="text-gray-500 text-lg">Sin contratos anuales. Cancela cuando quieras.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Trial */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-7 hover:border-gray-300 transition-colors flex flex-col">
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prueba gratuita</p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">7 días gratis</h3>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-extrabold text-gray-900">$0</span>
                  <span className="text-gray-400 mb-2 text-sm">COP</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Sin cobro los primeros 7 días · Sin compromisos</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {PLAN_TRIAL.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center py-3.5 border-2 border-gray-900 text-gray-900 font-bold rounded-xl hover:bg-gray-900 hover:text-white transition-all text-sm">
                Empezar prueba gratis
              </Link>
            </div>

            {/* Basic — highlighted */}
            <div className="relative border-2 border-teal-600 rounded-2xl p-7 bg-gradient-to-br from-slate-900 to-teal-950 shadow-2xl shadow-teal-900/30 overflow-hidden flex flex-col">
              <div className="absolute top-5 right-5 bg-amber-400 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                Recomendado
              </div>
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
              <div className="relative mb-5">
                <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">Plan BASIC</p>
                <h3 className="text-xl font-bold text-white mb-3">Para clínicas que crecen</h3>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-extrabold text-white">$100k</span>
                  <span className="text-teal-300 mb-2 text-sm">/mes COP</span>
                </div>
                <p className="text-xs text-teal-400 mt-1">≈ $25 USD · facturación mensual</p>
              </div>
              <ul className="relative space-y-2.5 mb-8 flex-1">
                {PLAN_BASIC.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-blue-100">
                    <svg className="w-4 h-4 text-teal-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="relative block text-center py-3.5 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-all text-sm shadow-lg">
                Empezar con BASIC →
              </Link>
            </div>
          </div>

          {/* Credits explainer */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="bg-teal-50 border border-teal-100 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">IA</div>
              <div>
                <p className="text-sm font-semibold text-teal-900 mb-0.5">¿Qué son los créditos IA?</p>
                <p className="text-xs text-teal-700 leading-relaxed">
                  1 crédito = 1 historia clínica generada por IA. Tu plan incluye créditos mensuales que se renuevan automáticamente.
                  ¿Necesitas más? Recarga desde <strong>$20.000 COP</strong> (50 créditos) directamente desde el panel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              Preguntas frecuentes
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Todo lo que necesitas saber</h2>
            <p className="text-gray-500">¿Tienes más dudas? Escríbenos por WhatsApp.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-teal-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <div className="text-5xl mb-6">🐾</div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Tu clínica merece la mejor<br />
            <span style={{ background: "linear-gradient(90deg, #2dd4bf, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              tecnología veterinaria.
            </span>
          </h2>
          <p className="text-slate-300 text-lg mb-10 leading-relaxed">
            Únete a las clínicas colombianas que ya están ahorrando horas cada semana con IA.
            7 días gratis — sin cobro los primeros 7 días, sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all shadow-xl shadow-teal-500/30 text-sm">
              Crear cuenta gratis — 7 días
            </Link>
            <Link href="/login" className="px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/8 transition-all font-medium text-sm">
              Ya tengo cuenta →
            </Link>
          </div>
          <p className="text-slate-500 text-xs mt-6">Sin cobro los primeros 7 días · Sin instalación · Configura en 5 minutos</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 py-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="Vetria" width={28} height={28} className="rounded-lg" />
                <span className="font-bold text-white text-lg">Vetria</span>
                <span className="text-[10px] bg-teal-900 text-teal-300 px-1.5 py-0.5 rounded font-medium">vetria.cloud</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-4">
                Software veterinario con IA para clínicas colombianas. Construido para que el veterinario se concentre en lo que importa: los pacientes.
              </p>
              <p className="text-slate-500 text-xs">🇨🇴 Hecho en Colombia para Latinoamérica</p>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Producto</p>
              <ul className="space-y-2.5">
                {["Funciones", "Precios", "Seguridad", "Changelog"].map((l) => (
                  <li key={l}><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Empresa</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Acerca de", href: "#" },
                  { label: "Contacto", href: "#" },
                  { label: "Términos de uso", href: "/terminos" },
                  { label: "Privacidad", href: "/privacidad" },
                ].map(({ label, href }) => (
                  <li key={label}><a href={href} className="text-slate-400 text-sm hover:text-white transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">© 2026 Vetria · vetria.cloud — Todos los derechos reservados.</p>
            <p className="text-slate-600 text-xs">Hecho con ❤️ para los veterinarios de Latinoamérica</p>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp flotante ── */}
      <a
        href="https://wa.me/573102247612?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20Vetria"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-xl shadow-green-500/40 transition-all hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
