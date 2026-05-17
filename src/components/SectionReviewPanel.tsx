"use client";

import { useState } from "react";
import { SectionCard } from "./SectionCard";
import {
  initSections,
  reconstructMarkdown,
  hasPendingSections,
  sectionsToRecord,
  type SectionState,
} from "@/lib/section-utils";

interface SectionReviewPanelProps {
  sections: Record<string, string>;
  onApprove: (finalNote: string, sections: Record<string, string>) => Promise<void>;
  onSaveAsDraft?: () => void;
  isApproving?: boolean;
}

export function SectionReviewPanel({
  sections: rawSections,
  onApprove,
  onSaveAsDraft,
  isApproving = false,
}: SectionReviewPanelProps) {
  const [sectionList, setSectionList] = useState<SectionState[]>(() =>
    initSections(rawSections)
  );

  function handleChange(key: string, content: string) {
    setSectionList((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, content, source: "vet" as const } : s
      )
    );
  }

  function handleRemove(key: string) {
    setSectionList((prev) =>
      prev.map((s) => (s.key === key ? { ...s, source: "removed" as const } : s))
    );
  }

  function handleRestore(key: string) {
    setSectionList((prev) =>
      prev.map((s) => (s.key === key ? { ...s, source: "ai" as const } : s))
    );
  }

  async function handleApprove() {
    const finalNote = reconstructMarkdown(sectionList);
    const sectionsRecord = sectionsToRecord(sectionList);
    await onApprove(finalNote, sectionsRecord);
  }

  const active = sectionList.filter((s) => s.source !== "removed");
  const removed = sectionList.filter((s) => s.source === "removed");
  const filledByAI = active.filter((s) => s.source === "ai" && s.content.trim() !== "").length;
  const pending = active.filter((s) => s.content.trim() === "").length;
  const blocked = hasPendingSections(sectionList) || isApproving;

  return (
    <div className="flex flex-col gap-3">
      {/* Barra de progreso */}
      <div className="text-xs text-gray-500">
        <div className="flex justify-between mb-1.5">
          <span>
            <span className="text-green-600 font-medium">{filledByAI} llenadas por IA</span>
            {pending > 0 && (
              <span className="text-amber-600 font-medium ml-2">· {pending} pendientes</span>
            )}
          </span>
          <span className="text-gray-400">{active.length} secciones activas</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
            style={{ width: `${active.length ? ((active.length - pending) / active.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Secciones activas */}
      {sectionList
        .filter((s) => s.source !== "removed")
        .map((section) => (
          <SectionCard
            key={section.key}
            section={section}
            onChange={handleChange}
            onRemove={handleRemove}
            onRestore={handleRestore}
          />
        ))}

      {/* Secciones quitadas */}
      {removed.length > 0 && (
        <div className="pt-1">
          <p className="text-xs text-gray-400 mb-2">{removed.length} sección{removed.length > 1 ? "es" : ""} quitada{removed.length > 1 ? "s" : ""}</p>
          {removed.map((section) => (
            <SectionCard
              key={section.key}
              section={section}
              onChange={handleChange}
              onRemove={handleRemove}
              onRestore={handleRestore}
            />
          ))}
        </div>
      )}

      {/* Alerta si hay secciones ámbar */}
      {pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
          Completa o quita las {pending} sección{pending > 1 ? "es" : ""} pendiente{pending > 1 ? "s" : ""} antes de aprobar.
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleApprove}
          disabled={blocked}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isApproving ? "Aprobando..." : "✓ Aprobar historia clínica"}
        </button>
        {onSaveAsDraft && (
          <button
            type="button"
            onClick={onSaveAsDraft}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            Revisar después
          </button>
        )}
      </div>
    </div>
  );
}
