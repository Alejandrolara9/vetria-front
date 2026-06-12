"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { usePagination } from "@/hooks/usePagination";
import { SearchInput } from "@/components/SearchInput";
import { PaginationBar } from "@/components/PaginationBar";
import { PrescriptionCard } from "@/components/prescriptions/PrescriptionCard";
import type { PaginatedResponse } from "@/types/pagination";
import { deletePrescription, type Prescription, type PrescriptionStatus } from "@/services/prescriptions";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);

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
    setPrescriptionToDelete(p);
    setDeleteConfirmOpen(true);
  }

  async function doDelete() {
    if (!prescriptionToDelete) return;
    setDeleteConfirmOpen(false);
    setDeletingId(prescriptionToDelete.id);
    try {
      await deletePrescription(prescriptionToDelete.id);
      setPrescriptionToDelete(null);
      setRefreshKey((k) => k + 1);
    } catch {
      alert("No se pudo eliminar la fórmula");
    } finally {
      setDeletingId(null);
    }
  }

  const emptyState = (
    <div className="text-center py-12 text-gray-400">
      <p className="text-lg">
        {search || statusFilter !== "ALL"
          ? "No se encontraron fórmulas con ese criterio."
          : "No hay fórmulas médicas registradas."}
      </p>
      {!search && statusFilter === "ALL" && (
        <Link
          href="/dashboard/prescriptions/new"
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          Crear la primera fórmula
        </Link>
      )}
    </div>
  );

  const skeleton = (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fórmulas Médicas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las prescripciones emitidas</p>
        </div>
        <Link
          href="/dashboard/prescriptions/new"
          className="flex-shrink-0 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Nueva fórmula
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar paciente, propietario o veterinario..."
            disabled={loading}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as PrescriptionStatus | "ALL");
            setPage(1);
          }}
          className="w-full sm:w-auto border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="SENT">Enviado</option>
          <option value="PRINTED">Impreso</option>
        </select>
      </div>

      {loading && prescriptions.length === 0 ? (
        skeleton
      ) : prescriptions.length === 0 ? (
        emptyState
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="md:hidden space-y-3">
            {prescriptions.map((p) => (
              <PrescriptionCard
                key={p.id}
                prescription={p}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
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
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                          title="Ver fórmula"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Ver
                        </Link>
                        {p.status === "DRAFT" && (
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p.id}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors disabled:opacity-50"
                            title="Eliminar fórmula"
                          >
                            {deletingId === p.id ? (
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            {deletingId === p.id ? "Eliminando…" : "Eliminar"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        loading={loading}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`¿Eliminar la fórmula de ${prescriptionToDelete?.pet.name}?`}
        variant="danger"
        loading={deletingId !== null}
        onConfirm={doDelete}
        onClose={() => { setDeleteConfirmOpen(false); setPrescriptionToDelete(null); }}
      />
    </div>
  );
}
