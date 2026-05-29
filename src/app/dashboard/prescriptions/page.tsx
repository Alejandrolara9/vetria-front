"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { usePagination } from "@/hooks/usePagination";
import { SearchInput } from "@/components/SearchInput";
import { PaginationBar } from "@/components/PaginationBar";
import type { PaginatedResponse } from "@/types/pagination";
import { deletePrescription, type Prescription, type PrescriptionStatus } from "@/services/prescriptions";

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
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PrescriptionsPage() {
  const [statusFilter, setStatusFilter] = useState<PrescriptionStatus | "ALL">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPrescriptions = useCallback(
    async (pg: number, lim: number, srch: string, signal: AbortSignal) => {
      const params = new URLSearchParams({
        page: String(pg),
        limit: String(lim),
        ...(srch ? { search: srch } : {}),
        ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      });
      const res = await api.get<PaginatedResponse<Prescription>>(
        `/prescriptions?${params}`,
        { signal }
      );
      return res.data;
    },
    [statusFilter, refreshKey]
  );

  const {
    data: prescriptions,
    total,
    page,
    totalPages,
    search,
    loading,
    setSearch,
    setPage,
  } = usePagination<Prescription>({ fetchFn: fetchPrescriptions });

  async function handleDelete(p: Prescription) {
    if (!confirm(`¿Eliminar la fórmula de ${p.pet.name}?`)) return;
    setDeletingId(p.id);
    try {
      await deletePrescription(p.id);
      setRefreshKey((k) => k + 1);
    } catch {
      alert("No se pudo eliminar la fórmula");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fórmulas Médicas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las prescripciones emitidas</p>
        </div>
        <Link
          href="/dashboard/prescriptions/new"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          + Nueva fórmula
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar paciente, propietario o veterinario..."
          disabled={loading}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as PrescriptionStatus | "ALL"); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="SENT">Enviado</option>
          <option value="PRINTED">Impreso</option>
        </select>
      </div>

      {loading && prescriptions.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">
            {search || statusFilter !== "ALL"
              ? "No se encontraron fórmulas con ese criterio."
              : "No hay fórmulas médicas registradas."}
          </p>
          {!search && statusFilter === "ALL" && (
            <Link href="/dashboard/prescriptions/new" className="text-sm text-primary hover:underline mt-2 inline-block">
              Crear la primera fórmula
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Paciente</th>
                <th className="px-4 py-3 text-left">Propietario</th>
                <th className="px-4 py-3 text-left">Veterinario</th>
                <th className="px-4 py-3 text-left">Fecha emisión</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prescriptions.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.pet.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.pet.client.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.vet.name}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.issueDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/prescriptions/${p.id}`}
                        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        Ver
                      </Link>
                      {p.status === "DRAFT" && (
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50"
                        >
                          {deletingId === p.id ? "..." : "Eliminar"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        loading={loading}
      />
    </div>
  );
}
