import {
  SECTION_ORDER,
  initSections,
  reconstructMarkdown,
  hasPendingSections,
  hasNewSectionsFormat,
  sectionsToRecord,
  type SectionState,
} from "../../lib/section-utils";

describe("SECTION_ORDER", () => {
  it("tiene 11 secciones en orden correcto", () => {
    expect(SECTION_ORDER).toHaveLength(11);
    expect(SECTION_ORDER[0].key).toBe("datos_del_paciente");
    expect(SECTION_ORDER[7].key).toBe("plan_terapeutico");
    expect(SECTION_ORDER[10].key).toBe("proxima_consulta");
  });
});

describe("initSections", () => {
  it("crea SectionState con source=ai para secciones con contenido", () => {
    const sections = { motivo_de_consulta: "Pancreatitis" };
    const result = initSections(sections);
    const motivo = result.find((s) => s.key === "motivo_de_consulta")!;
    expect(motivo.content).toBe("Pancreatitis");
    expect(motivo.source).toBe("ai");
  });

  it("crea SectionState con content vacío para secciones sin datos", () => {
    const result = initSections({});
    const anamnesis = result.find((s) => s.key === "anamnesis")!;
    expect(anamnesis.content).toBe("");
    expect(anamnesis.source).toBe("ai");
  });

  it("devuelve las 11 secciones siempre, independiente del input", () => {
    const result = initSections({ plan_terapeutico: "Fluidoterapia" });
    expect(result).toHaveLength(11);
  });
});

describe("reconstructMarkdown", () => {
  it("reconstruye markdown omitiendo secciones removed", () => {
    const sections: SectionState[] = [
      { key: "motivo_de_consulta", title: "2. Motivo de consulta", content: "Pancreatitis", source: "ai" },
      { key: "anamnesis", title: "3. Anamnesis", content: "Sin datos", source: "removed" },
    ];
    const result = reconstructMarkdown(sections);
    expect(result).toContain("## 2. Motivo de consulta");
    expect(result).toContain("Pancreatitis");
    expect(result).not.toContain("Anamnesis");
  });

  it("incluye secciones editadas por el vet", () => {
    const sections: SectionState[] = [
      { key: "pronostico", title: "9. Pronóstico", content: "Bueno", source: "vet" },
    ];
    const result = reconstructMarkdown(sections);
    expect(result).toContain("## 9. Pronóstico");
    expect(result).toContain("Bueno");
  });

  it("omite secciones con contenido vacío que no son removed", () => {
    const sections: SectionState[] = [
      { key: "anamnesis", title: "3. Anamnesis", content: "", source: "ai" },
    ];
    const result = reconstructMarkdown(sections);
    expect(result).not.toContain("Anamnesis");
  });
});

describe("hasPendingSections", () => {
  it("devuelve true si hay secciones ámbar (vacías y no removed)", () => {
    const sections: SectionState[] = [
      { key: "anamnesis", title: "3. Anamnesis", content: "", source: "ai" },
    ];
    expect(hasPendingSections(sections)).toBe(true);
  });

  it("devuelve false si todas las secciones tienen contenido o son removed", () => {
    const sections: SectionState[] = [
      { key: "motivo_de_consulta", title: "2. Motivo", content: "Pancreatitis", source: "ai" },
      { key: "anamnesis", title: "3. Anamnesis", content: "", source: "removed" },
    ];
    expect(hasPendingSections(sections)).toBe(false);
  });
});

describe("hasNewSectionsFormat", () => {
  it("devuelve true si sections tiene claves del nuevo formato", () => {
    expect(hasNewSectionsFormat({ motivo_de_consulta: "x", plan_terapeutico: "y" })).toBe(true);
  });

  it("devuelve false para sections undefined", () => {
    expect(hasNewSectionsFormat(undefined)).toBe(false);
  });

  it("devuelve false para el formato antiguo (nota_generada, signos_vitales)", () => {
    expect(hasNewSectionsFormat({ nota_generada: "texto", signos_vitales: "{}" })).toBe(false);
  });
});

describe("sectionsToRecord", () => {
  it("omite secciones con source=removed", () => {
    const sections: SectionState[] = [
      { key: "motivo_de_consulta", title: "2. Motivo de consulta", content: "Pancreatitis", source: "ai" },
      { key: "anamnesis", title: "3. Anamnesis", content: "Sin datos", source: "removed" },
    ];
    const result = sectionsToRecord(sections);
    expect(result).toHaveProperty("motivo_de_consulta", "Pancreatitis");
    expect(result).not.toHaveProperty("anamnesis");
  });

  it("incluye secciones con source=vet aunque tengan contenido vacío", () => {
    const sections: SectionState[] = [
      { key: "pronostico", title: "9. Pronóstico", content: "", source: "vet" },
    ];
    const result = sectionsToRecord(sections);
    expect(result).toHaveProperty("pronostico", "");
  });

  it("devuelve objeto vacío si todas las secciones son removed", () => {
    const sections: SectionState[] = [
      { key: "anamnesis", title: "3. Anamnesis", content: "algo", source: "removed" },
    ];
    const result = sectionsToRecord(sections);
    expect(result).toEqual({});
  });
});
