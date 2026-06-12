"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface ArchivedPet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  deletedAt: string;
  client: { id: string; name: string };
}

export default function ArchivedPetsPage() {
  const [pets, setPets] = useState<ArchivedPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [petToRestore, setPetToRestore] = useState<ArchivedPet | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await api.get("/pets/archived");
      setPets(res.data);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(pet: ArchivedPet) {
    setPetToRestore(pet);
    setRestoreConfirmOpen(true);
  }

  async function doRestore() {
    if (!petToRestore) return;
    setRestoreConfirmOpen(false);
    setRestoring(petToRestore.id);
    try {
      await api.post(`/pets/${petToRestore.id}/restore`, {});
      setPetToRestore(null);
      await loadData();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Error al restaurar");
    } finally {
      setRestoring(null);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mascotas Archivadas</h1>
          <p className="text-muted-foreground text-sm mt-1">{pets.length} mascotas archivadas</p>
        </div>
        <Link
          href="/dashboard/pets"
          className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          ← Volver a Mascotas
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : pets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No hay mascotas archivadas</p>
          <p className="text-sm">Las mascotas eliminadas aparecerán aquí</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mascota</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Especie / Raza</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tutor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Archivada el</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{pet.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {pet.species}{pet.breed ? ` - ${pet.breed}` : ""}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{pet.client.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(pet.deletedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRestore(pet)}
                      disabled={restoring === pet.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-green-200 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {restoring === pet.id ? "Restaurando..." : "Restaurar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={restoreConfirmOpen}
        title="¿Restaurar esta mascota?"
        variant="default"
        loading={restoring !== null}
        onConfirm={doRestore}
        onClose={() => { setRestoreConfirmOpen(false); setPetToRestore(null); }}
      />
    </div>
  );
}
