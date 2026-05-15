// src/components/clients/ClientCard.tsx
"use client";

import { useState } from "react";
import { PetCard, type Pet } from "./PetCard";
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
}

export function ClientCard({ client, onEditClient, onEditPet, onAddPet }: ClientCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          className="flex items-center gap-3 flex-1 text-left"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-base flex-shrink-0">
            👤
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{client.name}</p>
            <p className="text-xs text-muted-foreground">
              📞 {client.phone} · {client.pets.length}{" "}
              {client.pets.length === 1 ? "mascota" : "mascotas"}
            </p>
          </div>
          <span className="ml-2 text-muted-foreground text-xs flex-shrink-0">
            {expanded ? "▼" : "▶"}
          </span>
        </button>
        <button
          onClick={() => onEditClient(client)}
          className="ml-4 text-xs px-3 py-1.5 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 text-muted-foreground flex-shrink-0"
        >
          ✏️ Editar
        </button>
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
