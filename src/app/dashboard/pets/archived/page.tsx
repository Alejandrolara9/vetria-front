"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import Link from "next/link";

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

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await api.get("/pets/archived");
      setPets(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(id: string) {
    if (!confirm("¿Restaurar esta mascota?")) return;
    setRestoring(id);
    try {
      await api.post(`/pets/${id}/restore`, {});
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al restaurar");
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
          <p className="text-muted text-sm mt-1">{pets.length} mascotas archivadas</p>
        </div>
        <Link
          href="/dashboard/pets"
          className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          ← Volver a Mascotas
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Cargando...</div>
      ) : pets.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-lg mb-2">No hay mascotas archivadas</p>
          <p className="text-sm">Las mascotas eliminadas aparecerán aquí</p>
        </div>
      ) : (
        <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-muted">Mascota</th>
                <th className="text-left px-6 py-3 font-medium text-muted">Especie / Raza</th>
                <th className="text-left px-6 py-3 font-medium text-muted">Tutor</th>
                <th className="text-left px-6 py-3 font-medium text-muted">Archivada el</th>
                <th className="text-right px-6 py-3 font-medium text-muted">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{pet.name}</td>
                  <td className="px-6 py-4 text-muted">
                    {pet.species}{pet.breed ? ` - ${pet.breed}` : ""}
                  </td>
                  <td className="px-6 py-4 text-muted">{pet.client.name}</td>
                  <td className="px-6 py-4 text-muted">{formatDate(pet.deletedAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRestore(pet.id)}
                      disabled={restoring === pet.id}
                      className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors"
                    >
                      {restoring === pet.id ? "Restaurando..." : "Restaurar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
