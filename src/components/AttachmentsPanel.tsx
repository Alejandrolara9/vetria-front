"use client";

import { useState, useRef, useCallback } from "react";
import {
  uploadAttachment,
  getAttachmentViewUrl,
  reanalyzeAttachment,
  deleteAttachment,
  type Attachment,
} from "@/services/attachments";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const handleDelete = async (attachment: Attachment) => {
    if (!confirm(`¿Eliminar "${attachment.filename}"?`)) return;
    setDeletingId(attachment.id);
    try {
      await deleteAttachment(attachment.id);
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
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
        {attachments.map((a) => (
          <div key={a.id} className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">{FILE_ICON[a.fileType]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {a.filename}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatBytes(a.fileSize)} · {formatDate(a.createdAt)}
                    {a.aiAnalyzedAt && (
                      <span className="ml-1 text-green-600">· Analizado por IA</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleView(a)}
                  disabled={viewingId === a.id}
                  className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  {viewingId === a.id ? "..." : "Ver"}
                </button>
                <button
                  onClick={() => handleReanalyze(a)}
                  disabled={analyzingId === a.id}
                  className="text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 disabled:opacity-50"
                >
                  {analyzingId === a.id ? "Analizando..." : "Re-analizar"}
                </button>
                <button
                  onClick={() => handleDelete(a)}
                  disabled={deletingId === a.id}
                  className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50"
                >
                  {deletingId === a.id ? "..." : "Eliminar"}
                </button>
              </div>
            </div>

            {a.aiAnalysis && (
              <div className="mt-2">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === a.id ? null : a.id)
                  }
                  className="text-xs text-blue-600 hover:underline"
                >
                  {expandedId === a.id ? "Ocultar análisis IA ▲" : "Ver análisis IA ▼"}
                </button>
                {expandedId === a.id && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {a.aiAnalysis}
                  </div>
                )}
              </div>
            )}

            {a.analysisError && (
              <p className="mt-1 text-xs text-amber-600">{a.analysisError}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
