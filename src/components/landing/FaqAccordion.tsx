"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "¿Vetria funciona en toda Colombia?",
    a: "Sí. Vetria es 100% web y funciona en cualquier ciudad del país — Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Neiva, Manizales y más. No importa dónde esté tu clínica, solo necesitás un navegador y conexión a internet.",
  },
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

export default function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
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
  );
}
