// src/components/clients/ClientCard.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { PetCard, type Pet } from "./PetCard";
import { inviteClientToPortal } from "@/services/owner-portal";
import type { PortalStatus } from "@/lib/filterClients";

export interface ClientWithPets {
  id: string;
  name: string;
  phone: string;
  email: string;
  pets: Pet[];
  portalStatus: PortalStatus;
}

interface ClientCardProps {
  client: ClientWithPets;
  onEditClient: (client: ClientWithPets) => void;
  onEditPet: (pet: Pet, clientId: string) => void;
  onAddPet: (clientId: string) => void;
  onInvited: (clientId: string) => void;
}

/** Genera un color de fondo para el avatar basado en el nombre */
function avatarColor(name: string): string {
  const colors = [
    "bg-teal-500", "bg-blue-500", "bg-violet-500",
    "bg-rose-500",  "bg-amber-500", "bg-emerald-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function ClientCard({ client, onEditClient, onEditPet, onAddPet, onInvited }: ClientCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [resentFeedback, setResentFeedback] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  async function handleInvite(e: React.MouseEvent, isResend: boolean) {
    e.stopPropagation();
    setInviting(true);
    setInviteError("");
    setResentFeedback(false);
    try {
      await inviteClientToPortal(client.id);
      if (isResend) {
        setResentFeedback(true);
        timerRef.current = setTimeout(() => setResentFeedback(false), 3000);
      } else {
        onInvited(client.id);
      }
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "No se pudo enviar la invitación";
      setInviteError(msg);
    } finally {
      setInviting(false);
    }
  }

  const color = avatarColor(client.name);

  return (
    <div className="border border-border rounded-xl bg-white shadow-sm overflow-hidden">
      {/* ── Cabecera: clic en toda esta zona expande/colapsa ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((e) => !e)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-gray-50/60 transition-colors"
      >
        {/* Avatar con iniciales */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${color}`}>
          {initials(client.name)}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 leading-snug">{client.name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {client.phone}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500 truncate max-w-[180px]">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {client.email}
            </span>
          </div>

          {/* Fila inferior: mascotas + portal status */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.5 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm15 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-7.5-1a3 3 0 100-6 3 3 0 000 6zm-5 6c0-2.76 2.69-5 6-5 1.04 0 2.02.26 2.87.7A5.98 5.98 0 009 21H5a1 1 0 01-1-1v-4zm12 4h-4a5.98 5.98 0 00-2.87-5.3C14.31 14.26 15.29 14 16.29 14 19.6 14 22.29 16.24 22.29 19v1a1 1 0 01-1 1z"/>
              </svg>
              {client.pets.length} {client.pets.length === 1 ? "mascota" : "mascotas"}
            </span>

            {client.portalStatus === "INVITED" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Invitación pendiente
              </span>
            )}

            {client.portalStatus === "ACTIVE" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Portal activo
              </span>
            )}
          </div>
        </div>

        {/* Botón editar + chevron */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEditClient(client)}
            title="Editar cliente"
            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-blue-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <div
            role="button"
            onClick={() => setExpanded((e) => !e)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Barra de acción portal (solo si no está activo) ── */}
      {client.portalStatus === "NOT_INVITED" && (
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
          <button
            onClick={(e) => handleInvite(e, false)}
            disabled={inviting}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {inviting ? "Enviando…" : "Invitar al portal"}
          </button>
          {inviteError && <p className="text-xs text-red-500">{inviteError}</p>}
        </div>
      )}

      {client.portalStatus === "INVITED" && (
        <div className="px-4 pb-3 flex items-center gap-2">
          {resentFeedback ? (
            <span className="flex items-center gap-1 text-xs text-teal-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Reenviado
            </span>
          ) : (
            <button
              onClick={(e) => handleInvite(e, true)}
              disabled={inviting}
              className="text-xs text-teal-600 hover:underline disabled:opacity-50 font-medium"
            >
              {inviting ? "Enviando…" : "Reenviar invitación"}
            </button>
          )}
        </div>
      )}

      {/* ── Mascotas expandidas ── */}
      {expanded && (
        <div className="px-4 py-3 bg-gray-50 border-t border-border flex gap-3 flex-wrap">
          {client.pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onEdit={(p) => onEditPet(p, client.id)}
            />
          ))}
          <button
            onClick={() => onAddPet(client.id)}
            className="min-w-[90px] max-w-[110px] border border-dashed border-teal-300 bg-white rounded-lg p-3 flex flex-col items-center justify-center gap-1 text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium">Agregar</span>
          </button>
        </div>
      )}
    </div>
  );
}
