"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getTransactionStatus } from "@/services/payments";

type TxStatus = "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING" | "loading";
type PaymentReturnKind = "one-time" | "subscription" | "unknown";

const MAX_POLLS = 12;
const POLL_INTERVAL_MS = 3000;

function SubscriptionReturnContent({ mpStatus }: { mpStatus: string }) {
  const isAuthorized = mpStatus === "authorized" || mpStatus === "approved";
  const isCancelled  = mpStatus === "cancelled";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
          isAuthorized ? "bg-green-100" : isCancelled ? "bg-gray-100" : "bg-amber-100"
        }`}>
          {isAuthorized ? (
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : isCancelled ? (
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold">
          {isAuthorized
            ? "¡Suscripción activada!"
            : isCancelled
            ? "Suscripción cancelada"
            : "Suscripción en proceso"}
        </h1>

        <p className="text-muted-foreground text-sm">
          {isAuthorized
            ? "Tu plan BASIC se activará automáticamente en los próximos segundos. El cobro recurrente quedó autorizado con MercadoPago."
            : isCancelled
            ? "Cancelaste la autorización. Puedes volver a suscribirte cuando quieras."
            : "Tu suscripción está siendo procesada. El plan se activará automáticamente."}
        </p>

        <Link
          href="/dashboard/billing"
          className="inline-block mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:opacity-90"
        >
          {isAuthorized ? "Ir al dashboard" : "Volver a planes"}
        </Link>
      </div>
    </div>
  );
}

function PaymentReturnContent() {
  const searchParams   = useSearchParams();
  const [status, setStatus]   = useState<TxStatus>("loading");
  const [plan, setPlan]       = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [returnType, setReturnType] = useState<PaymentReturnKind>("unknown");
  const [mpStatus, setMpStatus]     = useState<string>("");
  const pollCount = useRef(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    // ── Subscription return: MP sends ?preapproval_id=XXX&status=authorized ──
    const preapprovalId = searchParams.get("preapproval_id");
    if (preapprovalId) {
      setReturnType("subscription");
      setMpStatus(searchParams.get("status") ?? "authorized");
      return;
    }

    // ── One-time payment return: MP sends ?external_reference=XXX ────────────
    const reference = searchParams.get("external_reference");
    if (!reference) { setReturnType("unknown"); setStatus("ERROR"); return; }

    setReturnType("one-time");

    const poll = () => {
      getTransactionStatus(reference)
        .then((tx) => {
          const s = tx.status as TxStatus;
          setPlan(tx.plan);
          setCredits(tx.credits);

          if (s === "PENDING" && pollCount.current < MAX_POLLS) {
            pollCount.current += 1;
            timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
          } else {
            setStatus(s);
          }
        })
        .catch(() => setStatus("ERROR"));
    };

    poll();
  }, [searchParams]);

  // ── Subscription result ───────────────────────────────────────────────────
  if (returnType === "subscription") {
    return <SubscriptionReturnContent mpStatus={mpStatus} />;
  }

  // ── One-time payment: loading ─────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Confirmando pago...</h1>
          <p className="text-muted-foreground text-sm">
            Estamos verificando la confirmación de MercadoPago. Esto puede tomar unos segundos.
          </p>
        </div>
      </div>
    );
  }

  // ── One-time payment: result ──────────────────────────────────────────────
  const isSuccess = status === "APPROVED";
  const isPending = status === "PENDING";

  function successMessage() {
    if (credits !== null) {
      return (
        <p className="text-muted-foreground">
          Se han añadido <span className="font-semibold text-primary">{credits} créditos IA</span> a tu cuenta. ¡Ya puedes usarlos!
        </p>
      );
    }
    return (
      <p className="text-muted-foreground">
        Tu plan ha sido actualizado a <span className="font-semibold text-primary">{plan}</span>.
        Ya puedes disfrutar de todas las funciones.
      </p>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
          isSuccess ? "bg-green-100" : isPending ? "bg-amber-100" : "bg-red-100"
        }`}>
          {isSuccess ? (
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : isPending ? (
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold">
          {isSuccess ? "¡Pago exitoso!" : isPending ? "Pago en proceso" : "Pago no completado"}
        </h1>

        {isSuccess ? successMessage() : isPending ? (
          <p className="text-muted-foreground text-sm">
            Tu pago fue recibido por MercadoPago y está siendo procesado.
            Los créditos o el plan se activarán automáticamente en los próximos minutos.
            Puedes cerrar esta página.
          </p>
        ) : (
          <p className="text-muted-foreground">
            El pago no fue procesado. Estado: <span className="font-medium">{status}</span>.
            Puedes intentarlo de nuevo desde la sección de planes.
          </p>
        )}

        <Link
          href="/dashboard/billing"
          className={`inline-block mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 ${
            isSuccess ? "bg-primary" : isPending ? "bg-amber-500" : "bg-primary"
          }`}
        >
          {isSuccess ? "Ir al dashboard" : isPending ? "Ver mi cuenta" : "Volver a planes"}
        </Link>
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  );
}
