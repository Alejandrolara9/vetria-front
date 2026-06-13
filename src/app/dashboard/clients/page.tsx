// src/app/dashboard/clients/page.tsx
"use client";

import { useCallback, useState } from "react";
import { api } from "@/services/api";
import { ClientCard, type ClientWithPets } from "@/components/clients/ClientCard";
import { ClientFormModal } from "@/components/clients/ClientFormModal";
import { PetFormModal } from "@/components/clients/PetFormModal";
import { usePagination } from "@/hooks/usePagination";
import { SearchInput } from "@/components/SearchInput";
import { PaginationBar } from "@/components/PaginationBar";
import type { PaginatedResponse } from "@/types/pagination";
import type { Pet } from "@/components/clients/PetCard";

export default function ClientsPage() {
  // refreshKey: incrementar fuerza un re-fetch sin cambiar búsqueda ni página
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchClients = useCallback(
    async (pg: number, lim: number, srch: string, signal: AbortSignal) => {
      const params = new URLSearchParams({
        page: String(pg),
        limit: String(lim),
        ...(srch ? { search: srch } : {}),
      });
      const res = await api.get<PaginatedResponse<ClientWithPets>>(`/clients?${params}`, { signal });
      return res.data;
    },
    [refreshKey]
  );

  const { data: clients, total, page, totalPages, search, loading, setSearch, setPage } =
    usePagination<ClientWithPets>({ fetchFn: fetchClients });

  // Modal state — se preserva exactamente igual que antes
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientWithPets | null>(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [targetClientId, setTargetClientId] = useState("");

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

  // Cierra el modal y re-fetcha para reflejar el cliente/mascota guardado
  function handleSaved() {
    setShowClientModal(false);
    setShowPetModal(false);
    setEditingClient(null);
    setEditingPet(null);
    setRefreshKey((k) => k + 1);
  }

  // Re-fetcha para que el portalStatus actualizado venga del servidor
  function handleInvited(_clientId: string) {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes y Mascotas</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} clientes registrados</p>
        </div>
        <button
          onClick={openNewClient}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          + Nuevo cliente
        </button>
      </div>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por cliente, teléfono, email o mascota…"
          loading={loading}
        />
      </div>

      {loading && clients.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {search ? "No se encontraron clientes con ese criterio." : "No hay clientes registrados."}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {clients.map((client) => (
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

      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        loading={loading}
      />

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
