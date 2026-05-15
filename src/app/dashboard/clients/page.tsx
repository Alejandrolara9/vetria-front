// src/app/dashboard/clients/page.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { ClientCard, type ClientWithPets } from "@/components/clients/ClientCard";
import { ClientFormModal } from "@/components/clients/ClientFormModal";
import { PetFormModal } from "@/components/clients/PetFormModal";
import { filterClients, type PortalStatus } from "@/lib/filterClients";
import type { Pet } from "@/components/clients/PetCard";

interface RawClient {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  portalStatus: PortalStatus;
}

interface RawPet extends Pet {
  client: { id: string };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithPets[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientWithPets | null>(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [targetClientId, setTargetClientId] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [clientsRes, petsRes] = await Promise.all([
        api.get<RawClient[]>("/clients"),
        api.get<RawPet[]>("/pets"),
      ]);
      const petsByClientId = petsRes.data.reduce<Record<string, Pet[]>>((acc, { client, ...pet }) => {
        acc[client.id] = [...(acc[client.id] ?? []), pet];
        return acc;
      }, {});
      setClients(
        clientsRes.data.map((c) => ({ ...c, pets: petsByClientId[c.id] ?? [] }))
      );
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  function openNewClient() {
    setEditingClient(null);
    setShowClientModal(true);
  }

  function openEditClient(client: ClientWithPets) {
    setEditingClient(client);
    setShowClientModal(true);
  }

  function openAddPet(clientId: string) {
    setEditingPet(null);
    setTargetClientId(clientId);
    setShowPetModal(true);
  }

  function openEditPet(pet: Pet, clientId: string) {
    setEditingPet(pet);
    setTargetClientId(clientId);
    setShowPetModal(true);
  }

  function handleSaved() {
    setShowClientModal(false);
    setShowPetModal(false);
    setEditingClient(null);
    setEditingPet(null);
    loadData();
  }

  function handleInvited(clientId: string) {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, portalStatus: "INVITED" as const } : c))
    );
  }

  const filtered = filterClients(clients, search);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes y Mascotas</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} clientes registrados</p>
        </div>
        <button
          onClick={openNewClient}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors text-sm font-medium"
        >
          + Nuevo cliente
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Buscar por cliente, teléfono, mascota, raza o especie..."
          className="w-full max-w-lg px-4 py-2 border border-border rounded-lg text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search
            ? "No se encontraron clientes ni mascotas con ese criterio."
            : "No hay clientes registrados."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEditClient={openEditClient}
              onEditPet={openEditPet}
              onAddPet={openAddPet}
              onInvited={handleInvited}
            />
          ))}
        </div>
      )}

      {showClientModal && (
        <ClientFormModal
          client={editingClient}
          onSave={handleSaved}
          onClose={() => { setShowClientModal(false); setEditingClient(null); }}
        />
      )}

      {showPetModal && (
        <PetFormModal
          clientId={targetClientId}
          pet={editingPet}
          onSave={handleSaved}
          onClose={() => { setShowPetModal(false); setEditingPet(null); }}
        />
      )}
    </div>
  );
}
