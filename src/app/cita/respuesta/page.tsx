"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const MESSAGES: Record<string, { icon: string; title: string; body: string; color: string }> = {
  confirmed: {
    icon: "✅",
    title: "Cita confirmada",
    body: "Perfecto. Nos vemos en la fecha acordada.",
    color: "text-green-700",
  },
  cancelled: {
    icon: "❌",
    title: "Cita cancelada",
    body: "Entendido. Para reagendar, contactá directamente a la clínica.",
    color: "text-red-700",
  },
  already_processed: {
    icon: "ℹ️",
    title: "Acción ya procesada",
    body: "Esta solicitud ya fue respondida anteriormente.",
    color: "text-blue-700",
  },
  invalid: {
    icon: "⚠️",
    title: "Link inválido",
    body: "Este link no es válido o ha expirado. Contactá a la clínica para más información.",
    color: "text-amber-700",
  },
};

function RespuestaContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "invalid";
  const msg = MESSAGES[status] ?? MESSAGES.invalid;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">{msg.icon}</div>
        <h1 className={`text-xl font-bold mb-2 ${msg.color}`}>{msg.title}</h1>
        <p className="text-gray-600 text-sm leading-relaxed">{msg.body}</p>
        <p className="mt-6 text-xs text-gray-400">Vetria — Sistema Veterinario</p>
      </div>
    </div>
  );
}

export default function RespuestaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50" />}>
      <RespuestaContent />
    </Suspense>
  );
}
