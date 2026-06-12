"use client";

import { useState, useRef, useCallback } from "react";
import {
  uploadAttachment,
  getAttachmentViewUrl,
  reanalyzeAttachment,
  deleteAttachment,
  type Attachment,
} from "@/services/attachments";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const FILE_ICON: Record<string, string> = { IMAGE: "🖼️", PDF: "📄" };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  petId: string;
  clinicalNoteId?: string;
  initialAttachments?: Attachment[];
}

export function AttachmentsPanel({
  petId,
  clinicalNoteId,
  initialAttachments = [],
}: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>("auto");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const allowed = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowed.includes(file.type)) {
        setUploadError("Solo se permiten archivos JPG, PNG o PDF");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setUploadError("El archivo no puede superar 20MB");
        return;
      }
      setUploadError(null);
      setUploading(true);
      try {
        const attachment = await uploadAttachment(petId, file, clinicalNoteId);
        setAttachments((prev) => [attachment, ...prev]);
        // Auto-expand analysis of the newly uploaded file
        setExpandedId(attachment.id);
      } catch {
        setUploadError("Error al subir el archivo. Intenta de nuevo.");
      } finally {
        setUploading(false);
      }
    },
    [petId, clinicalNoteId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleView = async (attachment: Attachment) => {
    setViewingId(attachment.id);
    try {
      const url = await getAttachmentViewUrl(attachment.id);
      window.open(url, "_blank");
    } catch {
      alert("No se pudo obtener el enlace del archivo");
    } finally {
      setViewingId(null);
    }
  };

  const handleReanalyze = async (attachment: Attachment) => {
    setAnalyzingId(attachment.id);
    try {
      const updated = await reanalyzeAttachment(attachment.id);
      setAttachments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch {
      alert("Error al re-analizar el archivo");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = (attachment: Attachment) => {
    setAttachmentToDelete(attachment);
    setDeleteConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!attachmentToDelete) return;
    setDeleteConfirmOpen(false);
    setDeletingId(attachmentToDelete.id);
    try {
      await deleteAttachment(attachmentToDelete.id);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentToDelete.id));
      setAttachmentToDelete(null);
    } catch {
      alert("Error al eliminar el archivo");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-blue-600 font-medium">
              Subiendo y analizando con IA...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">📎</span>
            <p className="text-sm text-gray-600">
              Arrastra un archivo aquí o{" "}
              <span className="text-blue-600 underline">haz clic para seleccionar</span>
            </p>
            <p className="text-xs text-gray-400">JPG, PNG o PDF — máx. 20MB</p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {uploadError}
        </p>
      )}

      {attachments.length === 0 && !uploading && (
        <p className="text-sm text-gray-400 text-center py-4">
          No hay archivos adjuntos
        </p>
      )}

      <div className="space-y-3">
        {attachments.map((a, idx) => {
          // Auto-expand the most recent file or the newly uploaded one
          const isExpanded = expandedId === a.id || (expandedId === "auto" && idx === 0);
          return (
            <div key={a.id} className="border rounded-lg bg-white shadow-sm overflow-hidden">
              {/* File header */}
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{FILE_ICON[a.fileType]}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{a.filename}</p>
                    <p className="text-xs text-gray-400">
                      {formatBytes(a.fileSize)} · {formatDate(a.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {a.aiAnalyzedAt && (
                    <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.5 rounded-full font-medium">
                      IA
                    </span>
                  )}
                  <button onClick={() => handleView(a)} disabled={viewingId === a.id}
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50">
                    {viewingId === a.id ? "..." : "Ver"}
                  </button>
                  <button onClick={() => handleReanalyze(a)} disabled={analyzingId === a.id}
                    className="text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 disabled:opacity-50">
                    {analyzingId === a.id ? "Analizando..." : "Re-analizar"}
                  </button>
                  <button onClick={() => handleDelete(a)} disabled={deletingId === a.id}
                    className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50">
                    {deletingId === a.id ? "..." : "×"}
                  </button>
                </div>
              </div>

              {/* AI analysis — expanded by default */}
              {a.aiAnalysis && (
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Análisis de IA — incluido en la historia clínica
                    </span>
                    <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="px-3 py-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-white border-t border-green-100">
                      {a.aiAnalysis}
                    </div>
                  )}
                </div>
              )}

              {/* Analyzing indicator */}
              {analyzingId === a.id && (
                <div className="border-t border-gray-100 px-3 py-2 bg-blue-50 flex items-center gap-2 text-xs text-blue-600">
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Analizando con IA...
                </div>
              )}

              {a.analysisError && (
                <p className="px-3 py-2 text-xs text-amber-700 bg-amber-50 border-t border-amber-100">
                  {a.analysisError}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`¿Eliminar "${attachmentToDelete?.filename}"?`}
        variant="danger"
        loading={deletingId !== null}
        onConfirm={doDelete}
        onClose={() => { setDeleteConfirmOpen(false); setAttachmentToDelete(null); }}
      />
    </div>
  );
}
