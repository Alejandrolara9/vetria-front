import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan Fundadores — Vetria",
  description:
    "Únete como clínica fundadora: $50.000 COP/mes los primeros 3 meses, luego $100.000/mes. Software veterinario con IA.",
};

const BENEFITS = [
  "Historia clínica con IA (notas breves → historia completa)",
  "Dictado por voz y análisis de laboratorios con IA",
  "Agenda con invitaciones al calendario",
  "Recordatorios automáticos de vacunas y desparasitación",
  "Portal del dueño de mascota",
  "Hasta 8 usuarios y 1.000 mascotas",
];

export default function FundadoresPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <span className="inline-block text-xs font-semibold text-amber-700 bg-amber-100 rounded-full px-4 py-1.5 mb-6">
          🏆 Plan Fundadores — cupo por tiempo limitado
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sé una clínica fundadora de Vetria
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Digitaliza tu clínica veterinaria con inteligencia artificial.
        </p>

        <div className="rounded-2xl border border-teal-200 bg-white shadow-sm p-8 mb-8 max-w-md mx-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Precio Fundadores</p>
          <p className="text-5xl font-bold text-gray-900">
            $50.000<span className="text-base font-normal text-gray-500"> COP/mes</span>
          </p>
          <p className="text-sm font-medium text-gray-700 mt-3">
            los primeros 3 meses, luego <strong>$100.000 COP/mes</strong>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            7 días de prueba gratis · sin contratos · cancela cuando quieras
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block w-full py-3 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            Empezar mi prueba gratis
          </Link>
        </div>

        <ul className="text-left max-w-md mx-auto space-y-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
              <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {b}
            </li>
          ))}
        </ul>

        <p className="text-xs text-gray-400 mt-12 max-w-md mx-auto">
          El Plan Fundadores aplica a la suscripción mensual: $50.000 COP/mes durante los primeros 3 cobros y
          $100.000 COP/mes a partir del cuarto. Precios en pesos colombianos, IVA incluido si aplica.
        </p>
      </section>
    </main>
  );
}
