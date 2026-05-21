import Link from "next/link";
import NavbarClient from "@/components/landing/NavbarClient";
import HeroMockup from "@/components/landing/HeroMockup";
import FaqAccordion from "@/components/landing/FaqAccordion";
import PricingCard from "@/components/landing/PricingCard";
import FeedbackForm from "@/components/landing/FeedbackForm";

const DEMO_WHATSAPP_URL =
  "https://wa.me/573102247612?text=Hola%2C%20me%20interesa%20ver%20una%20demo%20de%20Vetria%20para%20mi%20cl%C3%ADnica%20veterinaria.";

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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>

      {/* ── JSON-LD SCHEMA.ORG ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Vetria",
            description:
              "Software veterinario con IA para clínicas en Colombia. Historia clínica en 4 segundos, agenda inteligente y recordatorios automáticos.",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://vetria.cloud",
            inLanguage: "es-CO",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "COP",
              description: "7 días de prueba gratuita",
            },
            publisher: {
              "@type": "Organization",
              name: "Vetria",
              url: "https://vetria.cloud",
              logo: "https://vetria.cloud/logo.png",
              areaServed: "CO",
            },
          }),
        }}
      />

      {/* ── NAVBAR ── */}
      <NavbarClient />

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

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Link href="/register" className="px-7 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all text-center shadow-xl shadow-teal-600/30 text-sm">
                Empieza gratis — 7 días →
              </Link>
              <a href="#ia" className="px-7 py-4 border border-white/15 text-white rounded-xl hover:bg-white/8 transition-all text-center font-medium text-sm">
                Ver la IA en acción
              </a>
            </div>

            <a
              href={DEMO_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors font-medium mb-8"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              ¿Preferís ver la plataforma en acción? Solicitar demo gratis →
            </a>

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

          <HeroMockup />
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
          <FeedbackForm />
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
            <p className="text-gray-500 text-lg">Mensual, semestral o anual. Cancela cuando quieras.</p>
          </div>
          <PricingCard />
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
          <FaqAccordion />
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
