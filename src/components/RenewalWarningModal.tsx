"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  gracePeriodEndsAt: string;
}

const SESSION_KEY = "renewal_modal_dismissed";

export function RenewalWarningModal({ gracePeriodEndsAt }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [daysLeft, setDaysLeft] = useState(1);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const endsAt = new Date(gracePeriodEndsAt).getTime();
    const now = Date.now();
    if (endsAt > now) {
      setDaysLeft(Math.max(1, Math.ceil((endsAt - now) / 86_400_000)));
      setVisible(true);
    }
  }, [gracePeriodEndsAt]);

  if (!visible) return null;

  const endsDateStr = new Date(gracePeriodEndsAt).toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
  });

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  }

  function goToBilling() {
    dismiss();
    router.push("/dashboard/billing");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl" role="img" aria-label="warning">⚠️</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Tu plan vence en {daysLeft} día{daysLeft !== 1 ? "s" : ""}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              El cobro automático de tu plan BASIC no pudo procesarse.
              Renueva antes del <strong>{endsDateStr}</strong> para evitar
              la suspensión de tu cuenta.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={goToBilling}
            className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Renovar ahora
          </button>
          <button
            onClick={dismiss}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm transition-colors"
          >
            Recordarme después
          </button>
        </div>
      </div>
    </div>
  );
}
