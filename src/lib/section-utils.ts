export interface SectionState {
  key: string;
  title: string;
  content: string;
  source: "ai" | "vet" | "removed";
}

export const SECTION_ORDER: { key: string; title: string }[] = [
  { key: "datos_del_paciente",       title: "1. Datos del paciente" },
  { key: "motivo_de_consulta",       title: "2. Motivo de consulta" },
  { key: "anamnesis",                title: "3. Anamnesis" },
  { key: "examen_fisico",            title: "4. Examen físico" },
  { key: "lista_de_problemas",       title: "5. Lista de problemas" },
  { key: "diagnostico_diferencial",  title: "6. Diagnóstico diferencial" },
  { key: "plan_diagnostico",         title: "7. Plan diagnóstico" },
  { key: "plan_terapeutico",         title: "8. Plan terapéutico" },
  { key: "pronostico",               title: "9. Pronóstico" },
  { key: "recomendaciones_al_tutor", title: "10. Recomendaciones al tutor" },
  { key: "proxima_consulta",         title: "11. Próxima consulta" },
];

export function initSections(sections: Record<string, string>): SectionState[] {
  return SECTION_ORDER.map(({ key, title }) => ({
    key,
    title,
    content: sections[key] ?? "",
    source: "ai" as const,
  }));
}

export function reconstructMarkdown(sections: SectionState[]): string {
  return sections
    .filter((s) => s.source !== "removed" && s.content.trim() !== "")
    .map((s) => `## ${s.title}\n\n${s.content}`)
    .join("\n\n---\n\n");
}

export function hasPendingSections(sections: SectionState[]): boolean {
  return sections.some((s) => s.source !== "removed" && s.content.trim() === "");
}

export function hasNewSectionsFormat(sections: Record<string, string> | undefined): boolean {
  if (!sections) return false;
  return Object.keys(sections).some(
    (k) => k === "motivo_de_consulta" || k === "plan_terapeutico"
  );
}

export function sectionsToRecord(sections: SectionState[]): Record<string, string> {
  return Object.fromEntries(
    sections
      .filter((s) => s.source !== "removed")
      .map((s) => [s.key, s.content])
  );
}
