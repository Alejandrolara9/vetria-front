"use client";

import Link from "next/link";
import type { Prescription, PrescriptionStatus } from "@/services/prescriptions";

const STATUS_LABEL: Record<PrescriptionStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  PRINTED: "Impreso",
};

const STATUS_COLOR: Record<PrescriptionStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-green-100 text-green-700",
  PRINTED: "bg-blue-100 text-blue-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  prescription: Prescription;
  onDelete: (p: Prescription) => void;
  deletingId: string | null;
}

export function PrescriptionCard({ prescription: p, onDelete, deletingId }: Props) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c-3.59 0-6 2.01-6 4v1h12v-1c0-1.99-2.41-4-6-4zm-4-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm8 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-4-4c1.38 0 2.5-1.12 2.5-2.5S13.38 3 12 3 9.5 4.12 9.5 5.5 10.62 8 12 8zM5.5 11c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm13 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-base leading-snug">{p.pet.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(p.issueDate)}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 mt-1 ${STATUS_COLOR[p.status]}`}
        >
          {STATUS_LABEL[p.status]}
        </span>
      </div>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-sm">
          <span className="text-gray-400 font-medium">Dueño</span>
          <span className="text-gray-700 truncate">{p.pet.client.name}</span>
          <span className="text-gray-400 font-medium">Veterinario</span>
          <span className="text-gray-700 truncate">{p.vet.name}</span>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-border flex gap-2">
        <Link
          href={`/dashboard/prescriptions/${p.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Ver fórmula
        </Link>
        {p.status === "DRAFT" && (
          <button
            onClick={() => onDelete(p)}
            disabled={deletingId === p.id}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors disabled:opacity-50"
          >
            {deletingId === p.id ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
            {deletingId === p.id ? "Eliminando…" : "Eliminar"}
          </button>
        )}
      </div>
    </div>
  );
}
