"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getTransactionStatus } from "@/services/payments";

type TxStatus = "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING" | "loading";

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<TxStatus>("loading");
  const [plan, setPlan] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    // MP redirects with external_reference=tmpRef (the value we stored as reference)
    const reference = searchParams.get("external_reference");
    if (!reference) {
      setStatus("ERROR");
      return;
    }

    getTransactionStatus(reference)
      .then((tx) => {
        setStatus(tx.status as TxStatus);
        setPlan(tx.plan);
        setCredits(tx.credits);
      })
      .catch(() => setStatus("ERROR"));
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  const isSuccess = status === "APPROVED";

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
          isSuccess ? "bg-green-100" : "bg-red-100"
        }`}>
          {isSuccess ? (
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold">
          {isSuccess ? "¡Pago exitoso!" : "Pago no completado"}
        </h1>

        {isSuccess ? successMessage() : (
          <p className="text-muted-foreground">
            El pago no fue procesado. Estado: <span className="font-medium">{status}</span>.
            Puedes intentarlo de nuevo desde la sección de planes.
          </p>
        )}

        <Link
          href="/dashboard/billing"
          className="inline-block mt-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"
        >
          {isSuccess ? "Ir al dashboard" : "Volver a planes"}
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
