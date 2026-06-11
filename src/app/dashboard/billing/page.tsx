"use client";

import { useState, useEffect } from "react";
import {
  initiateSubscription,
  cancelSubscription,
  BILLING_PRICES,
  BILLING_DESCRIPTIONS,
  initiateCreditsCheckout,
  CREDIT_PACKS,
  FOUNDERS_PRICING,
  type BillingPeriod,
  type CreditPackIndex,
} from "@/services/payments";
import { fetchMyCredits } from "@/services/credits";

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

const FREE_FEATURES = [
  "Sin cobro los primeros 7 días",
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
  "100 créditos IA / período",
  "Hasta 8 usuarios",
  "Hasta 1.000 mascotas",
  "Historia clínica con IA",
  "Dictado por voz",
  "Análisis de imágenes y labs con IA",
  "Agenda + invitaciones al calendario",
  "Recordatorios automáticos",
  "Portal del dueño de mascota",
];

const PERIOD_LABELS: Record<BillingPeriod, string> = {
  MONTHLY:  "Mensual",
  SEMESTER: "Semestral",
  ANNUAL:   "Anual",
};

const PERIOD_BADGES: Partial<Record<BillingPeriod, string>> = {
  SEMESTER: "−15%",
  ANNUAL:   "⭐ 2 meses gratis",
};

const FOUNDERS_CAMPAIGN = process.env.NEXT_PUBLIC_FOUNDERS_CAMPAIGN === "true";

export default function BillingPage() {
  const [period, setPeriod]                     = useState<BillingPeriod>("MONTHLY");
  const [loadingSubscription, setLoadingSub]    = useState(false);
  const [loadingCancel, setLoadingCancel]       = useState(false);
  const [loadingCredits, setLoadingCredits]     = useState<CreditPackIndex | null>(null);
  const [error, setError]                       = useState("");
  const [currentPeriod, setCurrentPeriod]       = useState<BillingPeriod | null>(null);
  const [planPeriodEndsAt, setPlanPeriodEndsAt] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription]   = useState(false);
  const [founderPromo, setFounderPromo]         = useState(false);
  const [founderCycles, setFounderCycles]       = useState<number | null>(null);
  const [wasFounder, setWasFounder]             = useState(false);

  useEffect(() => {
    fetchMyCredits().then((c) => {
      if (c.billingPeriod) setCurrentPeriod(c.billingPeriod as BillingPeriod);
      if (c.planPeriodEndsAt) setPlanPeriodEndsAt(c.planPeriodEndsAt);
      setHasSubscription(!!c.mpSubscriptionId);
      setFounderPromo(c.founderPromo);
      setFounderCycles(c.founderCyclesRemaining);
      setWasFounder(c.wasFounder);
    }).catch(() => { /* show page without subscription info */ });
  }, []);

  async function handleSubscribe(founders = false) {
    setError("");
    setLoadingSub(true);
    try {
      const { checkoutUrl } = await initiateSubscription(period, founders);
      globalThis.window.location.assign(checkoutUrl);
    } catch {
      setError("No se pudo iniciar la suscripción. Intenta de nuevo.");
      setLoadingSub(false);
    }
  }

  async function handleCancel() {
    if (!confirm("¿Seguro que quieres cancelar tu suscripción? Tu plan permanecerá activo hasta su fecha de vencimiento.")) return;
    setError("");
    setLoadingCancel(true);
    try {
      await cancelSubscription();
      setHasSubscription(false);
      setCurrentPeriod(null);
    } catch {
      setError("No se pudo cancelar la suscripción. Intenta de nuevo.");
    } finally {
      setLoadingCancel(false);
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

  const periodEndsStr = planPeriodEndsAt
    ? new Date(planPeriodEndsAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const foundersOffer = FOUNDERS_CAMPAIGN && !hasSubscription && !wasFounder && period === "MONTHLY";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Planes y facturación</h1>
        <p className="text-sm text-muted-foreground mt-1">
          7 días gratis. Luego crece sin límites. Sin contratos anuales. Cancela cuando quieras.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Period toggle */}
      <div className="flex gap-2 flex-wrap">
        {(["MONTHLY", "SEMESTER", "ANNUAL"] as BillingPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              period === p
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
            }`}
          >
            {PERIOD_LABELS[p]}
            {PERIOD_BADGES[p] && (
              <span className="ml-2 text-xs">{PERIOD_BADGES[p]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free trial */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Prueba gratuita</p>
            <h3 className="text-xl font-bold">7 días gratis</h3>
            <p className="text-3xl font-bold mt-1">
              $0<span className="text-sm font-normal text-muted-foreground"> COP</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Sin cobro los primeros 7 días</p>
          </div>
          <ul className="space-y-2 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm"><CheckIcon />{f}</li>
            ))}
          </ul>
          <button disabled className="w-full py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed">
            Empezar prueba gratis
          </button>
          <p className="text-xs text-center text-muted-foreground -mt-2">La prueba gratuita se activa al registrarte</p>
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
              ${(foundersOffer ? FOUNDERS_PRICING.promoPriceCOP : BILLING_PRICES[period]).toLocaleString("es-CO")}
              <span className="text-sm font-normal text-muted-foreground"> COP</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {foundersOffer
                ? `Plan Fundadores: $${FOUNDERS_PRICING.promoPriceCOP.toLocaleString("es-CO")}/mes los primeros ${FOUNDERS_PRICING.promoMonths} meses, luego $${FOUNDERS_PRICING.standardPriceCOP.toLocaleString("es-CO")}/mes`
                : BILLING_DESCRIPTIONS[period]}
            </p>
          </div>
          <ul className="space-y-2 flex-1">
            {BASIC_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm"><CheckIcon />{f}</li>
            ))}
          </ul>

          {hasSubscription ? (
            <div className="space-y-2">
              <p className="text-xs text-center text-green-600 font-medium">
                ✅ Suscripción activa · {currentPeriod ? PERIOD_LABELS[currentPeriod] : ""}
                {periodEndsStr && ` · próximo cobro ${periodEndsStr}`}
              </p>
              {founderPromo && (
                <p className="text-xs text-center text-amber-600 font-medium">
                  🏆 Plan Fundadores · {founderCycles ?? 0} {founderCycles === 1 ? "cobro" : "cobros"} de $50.000 restantes
                </p>
              )}
              <button
                onClick={handleCancel}
                disabled={loadingCancel}
                className="w-full py-2.5 rounded-lg text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {loadingCancel ? "Cancelando..." : "Cancelar suscripción"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleSubscribe(foundersOffer)}
              disabled={loadingSubscription}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loadingSubscription ? "Iniciando..." : foundersOffer ? "Quiero ser Fundador" : "Suscribirse"}
            </button>
          )}
        </div>
      </div>

      {/* AI Credits */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Comprar créditos adicionales</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {CREDIT_PACKS.map((pack, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{pack.label}</p>
                <p className="text-xs text-muted-foreground">${pack.priceCOP.toLocaleString("es-CO")} COP</p>
              </div>
              <button
                onClick={() => handleCreditsPurchase(i as CreditPackIndex)}
                disabled={loadingCredits !== null}
                className="px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                {loadingCredits === i ? "..." : "Comprar"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
