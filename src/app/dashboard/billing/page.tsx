"use client";

import { useState } from "react";
import {
  initiateCheckout,
  initiateCreditsCheckout,
  PLAN_PRICES,
  PLAN_LABELS,
  CREDIT_PACKS,
  PlanTarget,
  CreditPackIndex,
} from "@/services/wompi";

const PLAN_FEATURES: Record<PlanTarget, string[]> = {
  BASIC: [
    "Hasta 8 usuarios",
    "Hasta 1.000 mascotas",
    "100 créditos IA / mes",
    "Notas clínicas con IA",
    "Recordatorios inteligentes",
  ],
  PRO: [
    "Hasta 25 usuarios",
    "Hasta 10.000 mascotas",
    "400 créditos IA / mes",
    "Todo lo de BASIC",
    "Recordatorios por WhatsApp",
    "Reportes avanzados",
  ],
};

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

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
          Elige el plan o recarga créditos IA. Los pagos se procesan de forma segura con Wompi.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Planes */}
      <div>
        <h2 className="text-base font-semibold mb-3">Planes mensuales</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {(["BASIC", "PRO"] as PlanTarget[]).map((plan) => (
            <div
              key={plan}
              className={`rounded-xl border p-6 flex flex-col gap-4 ${
                plan === "PRO" ? "border-primary bg-primary/5" : "border-gray-200 bg-white"
              }`}
            >
              {plan === "PRO" && (
                <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 self-start">
                  Más popular
                </span>
              )}
              <div>
                <h3 className="text-xl font-bold">{PLAN_LABELS[plan]}</h3>
                <p className="text-3xl font-bold mt-1">
                  ${PLAN_PRICES[plan].toLocaleString("es-CO")}
                  <span className="text-sm font-normal text-muted-foreground"> COP / mes</span>
                </p>
              </div>
              <ul className="space-y-2 flex-1">
                {PLAN_FEATURES[plan].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan)}
                disabled={isAnyLoading}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  plan === "PRO"
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-primary text-primary hover:bg-primary/5"
                }`}
              >
                {loadingPlan === plan ? "Redirigiendo a Wompi..." : `Contratar ${PLAN_LABELS[plan]}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Packs de créditos */}
      <div>
        <h2 className="text-base font-semibold mb-1">Recargar créditos IA</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Los créditos se añaden de forma inmediata al confirmar el pago.
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
                {loadingCredits === i ? "Redirigiendo a Wompi..." : `Comprar ${pack.label}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Pagos procesados de forma segura por{" "}
        <span className="font-medium">Wompi (Bancolombia)</span>. Al contratar aceptas los términos de servicio.
      </p>
    </div>
  );
}
