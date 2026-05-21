"use client";

import { useState } from "react";
import Link from "next/link";

type BillingPeriod = "MONTHLY" | "SEMESTER" | "ANNUAL";

const BILLING_OPTIONS: { id: BillingPeriod; label: string; price: string; sub: string; badge: string | null }[] = [
  { id: "MONTHLY",  label: "Mensual",    price: "$100k",  sub: "/mes COP",      badge: null },
  { id: "SEMESTER", label: "Semestral",  price: "$510k",  sub: "/6 meses COP",  badge: "−15%" },
  { id: "ANNUAL",   label: "Anual",      price: "$1M",    sub: "/año COP",      badge: "2 meses gratis" },
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

export default function PricingCard() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("MONTHLY");

  return (
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

      {/* Basic */}
      <div className="relative border-2 border-teal-600 rounded-2xl p-7 bg-gradient-to-br from-slate-900 to-teal-950 shadow-2xl shadow-teal-900/30 overflow-hidden flex flex-col">
        <div className="absolute top-5 right-5 bg-amber-400 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
          Recomendado
        </div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative mb-5">
          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">Plan BASIC</p>
          <h3 className="text-xl font-bold text-white mb-4">Para clínicas que crecen</h3>

          <div className="flex bg-slate-800/70 rounded-xl p-1 gap-0.5 mb-5">
            {BILLING_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setBillingPeriod(opt.id)}
                className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all ${
                  billingPeriod === opt.id
                    ? "bg-teal-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {BILLING_OPTIONS.filter((o) => o.id === billingPeriod).map((opt) => (
            <div key={opt.id}>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold text-white">{opt.price}</span>
                <span className="text-teal-300 mb-2 text-sm">{opt.sub}</span>
              </div>
              {opt.badge && (
                <span className="inline-block mt-1.5 bg-amber-400/20 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {opt.badge}
                </span>
              )}
            </div>
          ))}
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
  );
}
