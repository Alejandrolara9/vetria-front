"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type State = "loading" | "success" | "already" | "error";

export default function ConfirmReminderPage() {
  const params = useParams();
  const id = params?.id as string;
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!id) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

    fetch(`${apiUrl}/reminders/confirm/${id}`, { method: "PATCH" })
      .then(async (res) => {
        if (res.ok) {
          setState("success");
        } else {
          const body = await res.json().catch(() => ({}));
          // Si ya estaba confirmada lo tratamos de forma amigable
          if (body?.message?.includes("Record to update not found") || res.status === 400) {
            setState("already");
          } else {
            setState("error");
          }
        }
      })
      .catch(() => setState("error"));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Vetria</h1>
          <p className="text-sm text-gray-500">Sistema Veterinario</p>
        </div>

        {state === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Confirmando tu cita...</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Cita confirmada!</h2>
            <p className="text-gray-600 text-sm">
              Gracias por confirmar. La clínica ha sido notificada y te esperamos en la fecha programada.
            </p>
            <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-800">
              Recuerda llegar con 10 minutos de anticipación y traer el carnet de vacunación de tu mascota si lo tienes.
            </div>
          </>
        )}

        {state === "already" && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ya confirmada</h2>
            <p className="text-gray-600 text-sm">
              Esta cita ya fue confirmada anteriormente. ¡Te esperamos!
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Enlace no válido</h2>
            <p className="text-gray-600 text-sm">
              Este enlace de confirmación no es válido o ya expiró. Puedes contactar a la clínica directamente si tienes dudas.
            </p>
          </>
        )}

        <p className="text-xs text-gray-400 mt-8">
          Powered by Vetria · Sistema de gestión veterinaria
        </p>
      </div>
    </div>
  );
}
