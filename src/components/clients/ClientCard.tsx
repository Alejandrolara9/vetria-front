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

export function ClientCard({ client, onEditClient, onEditPet, onAddPet, onInvited }: ClientCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [resentFeedback, setResentFeedback] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleInvite(isResend: boolean) {
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

  return (
    <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="px-4 py-3">
        {/* Fila principal — toda clickeable para expandir */}
        <button
          className="w-full flex items-start gap-3 text-left group"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{client.name}</p>
            <p className="text-xs text-muted-foreground truncate">📞 {client.phone}</p>
            <p className="text-xs text-muted-foreground truncate">✉️ {client.email}</p>
          </div>
          {/* Chip de mascotas — affordance visual clara */}
          <span className={`flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors mt-0.5 ${
            expanded
              ? "bg-teal-50 border-teal-200 text-teal-700"
              : "bg-gray-100 border-gray-200 text-gray-600 group-hover:bg-teal-50 group-hover:border-teal-200 group-hover:text-teal-700"
          }`}>
            🐾 {client.pets.length} {client.pets.length === 1 ? "mascota" : "mascotas"}
            <span className="text-[10px] ml-0.5">{expanded ? "▲" : "▼"}</span>
          </span>
        </button>

        {/* Fila de acciones */}
        <div className="flex items-center gap-2 mt-2.5 ml-12 flex-wrap">
          <button
            onClick={() => onEditClient(client)}
            className="text-xs px-3 py-1.5 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 text-muted-foreground"
          >
            ✏️ Editar
          </button>

          {client.portalStatus === "NOT_INVITED" && (
            <>
              <button
                onClick={() => handleInvite(false)}
                disabled={inviting}
                className="text-xs px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 text-teal-700 disabled:opacity-50"
              >
                {inviting ? "Enviando…" : "✉️ Invitar al portal"}
              </button>
              {inviteError && (
                <p className="text-xs text-red-500 w-full">{inviteError}</p>
              )}
            </>
          )}

          {client.portalStatus === "INVITED" && (
            <>
              <span className="text-xs px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
                🕐 Invitación enviada
              </span>
              {resentFeedback ? (
                <span className="text-xs text-teal-600">✓ Reenviado</span>
              ) : (
                <button
                  onClick={() => handleInvite(true)}
                  disabled={inviting}
                  className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                >
                  {inviting ? "…" : "Reenviar"}
                </button>
              )}
            </>
          )}

          {client.portalStatus === "ACTIVE" && (
            <span className="text-xs px-2 py-1 bg-green-50 border border-green-200 rounded-lg text-green-700">
              🟢 Portal activo
            </span>
          )}
        </div>
      </div>

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
            className="min-w-[90px] max-w-[110px] border border-dashed border-green-300 bg-white rounded-lg p-3 flex flex-col items-center justify-center gap-1 text-green-700 hover:bg-green-50"
          >
            <span className="text-xl">+</span>
            <span className="text-xs font-medium">Agregar mascota</span>
          </button>
        </div>
      )}
    </div>
  );
}
