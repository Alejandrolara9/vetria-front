"use client";

import { useState } from "react";
import type { SectionState } from "@/lib/section-utils";

interface SectionCardProps {
  section: SectionState;
  onChange: (key: string, content: string) => void;
  onRemove: (key: string) => void;
  onRestore: (key: string) => void;
}

export function SectionCard({ section, onChange, onRemove, onRestore }: SectionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(section.content);

  const isEmpty = section.content.trim() === "";
  const isRemoved = section.source === "removed";
  const isVet = section.source === "vet";

  function saveEdit() {
    onChange(section.key, draft.trim());
    setIsEditing(false);
  }

  function cancelEdit() {
    setDraft(section.content);
    setIsEditing(false);
  }

  // Estado: quitada
  if (isRemoved) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden opacity-50">
        <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
            <strong className="text-sm text-gray-400 line-through">{section.title}</strong>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Quitada</span>
          </div>
          <button
            type="button"
            onClick={() => onRestore(section.key)}
            className="text-xs text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50"
          >
            ↩ Restaurar
          </button>
        </div>
      </div>
    );
  }

  // Estado: ámbar — vacía, editando
  if (isEmpty && isEditing) {
    return (
      <div className="border-2 border-amber-300 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2.5 bg-amber-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <strong className="text-sm text-amber-800">{section.title}</strong>
            <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Editando...</span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={saveEdit}
              className="text-xs text-green-700 bg-green-100 border border-green-300 rounded px-2 py-1 font-semibold hover:bg-green-200"
            >
              ✓ Guardar
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
        <div className="px-4 py-2.5 border-t border-amber-200">
          <textarea
            autoFocus
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full text-sm border border-amber-200 rounded-lg px-3 py-2 bg-amber-50 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
            placeholder="Escribe el contenido de esta sección..."
          />
        </div>
      </div>
    );
  }

  // Estado: ámbar — vacía, colapsada
  if (isEmpty) {
    return (
      <div className="border-2 border-amber-300 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2.5 bg-amber-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <strong className="text-sm text-amber-800">{section.title}</strong>
            <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Sin datos — completar</span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => { setDraft(""); setIsEditing(true); }}
              className="text-xs text-amber-800 bg-amber-100 border border-amber-300 rounded px-2 py-1 font-semibold hover:bg-amber-200"
            >
              + Completar
            </button>
            <button
              type="button"
              onClick={() => onRemove(section.key)}
              className="text-xs text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-50"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado: verde (ai) o azul (vet) — con contenido, editando
  if (isEditing) {
    const borderColor = isVet ? "border-blue-300" : "border-green-300";
    const bgColor = isVet ? "bg-blue-50" : "bg-green-50";
    const inputBorder = isVet ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50";
    return (
      <div className={`border-2 ${borderColor} rounded-xl overflow-hidden`}>
        <div className={`flex justify-between items-center px-4 py-2.5 ${bgColor}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isVet ? "bg-blue-500" : "bg-green-500"} inline-block`} />
            <strong className="text-sm">{section.title}</strong>
            <span className={`text-xs px-2 py-0.5 rounded-full ${isVet ? "text-blue-700 bg-blue-100" : "text-green-700 bg-green-100"}`}>
              Editando...
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={saveEdit}
              className="text-xs text-green-700 bg-green-100 border border-green-300 rounded px-2 py-1 font-semibold hover:bg-green-200"
            >
              ✓ Guardar
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100">
          <textarea
            autoFocus
            rows={6}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={`w-full text-sm border ${inputBorder} rounded-lg px-3 py-2 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-200`}
          />
        </div>
      </div>
    );
  }

  // Estado: verde (ai) o azul (vet) — con contenido, expandida
  const borderColor = isVet ? "border-blue-200" : "border-green-200";
  const headerBg = isVet ? "bg-blue-50" : "bg-green-50";
  const dotColor = isVet ? "bg-blue-500" : "bg-green-500";
  const badge = isVet
    ? <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Editada por vet</span>
    : <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">IA</span>;

  return (
    <div className={`border-2 ${borderColor} rounded-xl overflow-hidden`}>
      <div className={`flex justify-between items-center px-4 py-2.5 ${headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor} inline-block`} />
          <strong className="text-sm">{section.title}</strong>
          {badge}
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => { setDraft(section.content); setIsEditing(true); }}
            className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50"
          >
            ✏ Editar
          </button>
          <button
            type="button"
            onClick={() => onRemove(section.key)}
            className="text-xs text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      </div>
      <div className={`px-4 py-3 text-sm text-gray-700 leading-relaxed border-t ${isVet ? "border-blue-100" : "border-green-100"}`}>
        <div className="whitespace-pre-wrap">{section.content}</div>
      </div>
    </div>
  );
}
