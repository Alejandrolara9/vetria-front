"use client";

import { useState } from "react";
import {
  initiateCheckout,
  initiateCreditsCheckout,
  PLAN_PRICES,
  CREDIT_PACKS,
  PlanTarget,
  CreditPackIndex,
} from "@/services/payments";

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

const FREE_FEATURES = [
  "30 días gratis · sin tarjeta",
  "100 créditos IA incluidos",
  "Todas las funciones del plan BASIC",
  "Hasta 8 usuarios",
  "Hasta 1.000 mascotas",
  "Historia clínica con IA",
  "Dictado por voz",
  "Agenda con invitación de calendario",
  "Soporte por email",
];

const BASIC_FEATURES = [
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

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanTarget | null>(null);
  const [loadingCredits, setLoadingCredits] = useState<CreditPackIndex | null>(null);
  const [error, setError] = useState("");

  async function handleUpgrade(plan: PlanTarget) {
    setError("");
    setLoadingPlan(plan);
    try {
      const { checkoutUrl } = await initiateCheckout(plan);
      globalThis.window.location.assign(checkoutUrl);
    } catch {
      setError("No se pudo iniciar el pago. Intenta de nuevo.");
      setLoadingPlan(null);
    }
  }

  async function handleCreditsPurchase(packIndex: CreditPackIndex) {
    setError("");
    setLoadingCredits(packIndex);
    try {
      const { checkoutUrl } = await initiateCreditsCheckout(packIndex);
      globalThis.window.location.assign(checkoutUrl);
    } catch {
      setError("No se pudo iniciar el pago. Intenta de nuevo.");
      setLoadingCredits(null);
    }
  }

  const isAnyLoading = loadingPlan !== null || loadingCredits !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Planes y facturación</h1>
        <p className="text-sm text-muted-foreground mt-1">
          30 días gratis. Luego crece sin límites. Sin contratos anuales. Cancela cuando quieras.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Planes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Prueba gratuita */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Prueba gratuita</p>
            <h3 className="text-xl font-bold">30 días gratis</h3>
            <p className="text-3xl font-bold mt-1">
              $0
              <span className="text-sm font-normal text-muted-foreground"> COP</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Sin tarjeta de crédito · Sin compromisos</p>
          </div>
          <ul className="space-y-2 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>
          <button
            disabled
            className="w-full py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
          >
            Empezar prueba gratis
          </button>
          <p className="text-xs text-center text-muted-foreground -mt-2">
            La prueba gratuita se activa al registrarte
          </p>
        </div>

        {/* Plan BASIC */}
        <div className="rounded-xl border border-primary bg-primary/5 p-6 flex flex-col gap-4">
          <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 self-start">
            Recomendado
          </span>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Plan BASIC</p>
            <h3 className="text-xl font-bold">Para clínicas que crecen</h3>
            <p className="text-3xl font-bold mt-1">
              ${PLAN_PRICES.BASIC.toLocaleString("es-CO")}
              <span className="text-sm font-normal text-muted-foreground"> /mes COP</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">≈ $25 USD · facturación mensual</p>
          </div>
          <ul className="space-y-2 flex-1">
            {BASIC_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleUpgrade("BASIC")}
            disabled={isAnyLoading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loadingPlan === "BASIC" ? "Redirigiendo a MercadoPago..." : "Empezar con BASIC →"}
          </button>
        </div>
      </div>

      {/* Packs de créditos */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold bg-purple-100 text-purple-700 rounded px-2 py-0.5">IA</span>
          <h2 className="text-base font-semibold">¿Qué son los créditos IA?</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          1 crédito = 1 historia clínica generada por IA. Tu plan incluye créditos mensuales que se renuevan
          automáticamente. ¿Necesitas más? Recarga desde{" "}
          <span className="font-medium">$20.000 COP (50 créditos)</span> directamente desde el panel.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {CREDIT_PACKS.map((pack, i) => (
            <div
              key={pack.credits}
              className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3"
            >
              <div>
                <p className="text-lg font-bold">{pack.label}</p>
                <p className="text-2xl font-bold mt-1">
                  ${pack.priceCOP.toLocaleString("es-CO")}
                  <span className="text-sm font-normal text-muted-foreground"> COP</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ${Math.round(pack.priceCOP / pack.credits).toLocaleString("es-CO")} por crédito
                </p>
              </div>
              <button
                onClick={() => handleCreditsPurchase(i as CreditPackIndex)}
                disabled={isAnyLoading}
                className="w-full py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loadingCredits === i ? "Redirigiendo..." : `Comprar ${pack.label}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Pagos procesados de forma segura por{" "}
        <span className="font-medium">MercadoPago</span>. Al contratar aceptas los términos de servicio.
      </p>
    </div>
  );
}
