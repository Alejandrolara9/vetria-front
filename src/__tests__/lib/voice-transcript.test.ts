import { buildTranscript, type VoiceResult } from "../../lib/voice-transcript";

// Construye un SpeechRecognitionResultList simulado a partir de transcripts.
function results(...transcripts: string[]): VoiceResult[] {
  return transcripts.map((transcript) => ({ isFinal: false, 0: { transcript } }));
}

describe("buildTranscript", () => {
  it("devuelve cadena vacía cuando no hay resultados", () => {
    expect(buildTranscript([])).toBe("");
  });

  it("una sola entrada se devuelve recortada", () => {
    expect(buildTranscript(results("  glándulas salivales  "))).toBe("glándulas salivales");
  });

  it("colapsa prefijos crecientes de la misma frase (no concatena)", () => {
    // Caso central: Android reenvía la frase acumulada como entradas separadas.
    const r = results(
      "glándulas",
      "glándulas salivales",
      "glándulas salivales inflamadas"
    );
    expect(buildTranscript(r)).toBe("glándulas salivales inflamadas");
  });

  it("colapsa interinos idénticos repetidos", () => {
    const r = results("glándulas", "glándulas", "glándulas", "glándulas salivales");
    expect(buildTranscript(r)).toBe("glándulas salivales");
  });

  it("reproduce el patrón de la captura problema.jpeg y lo deja limpio", () => {
    // Secuencia de prefijos crecientes que, concatenada ingenuamente, producía
    // "glándulasglándulas salivalesglándulas salivales...".
    const r = results(
      "glándulas",
      "glándulas salivales",
      "glándulas salivales",
      "glándulas salivales",
      "glándulas salivales inflamadas"
    );
    expect(buildTranscript(r)).toBe("glándulas salivales inflamadas");
  });

  it("reproduce el patrón de la captura image.png y lo deja limpio", () => {
    const r = results(
      "glándulas",
      "glándulas",
      "glándulas",
      "glándulas",
      "glándulas",
      "glándulas",
      "glándulas salivales",
      "glándulas salivales inflamadas"
    );
    expect(buildTranscript(r)).toBe("glándulas salivales inflamadas");
  });

  it("concatena frases distintas con un espacio (caso escritorio multi-frase)", () => {
    const r: VoiceResult[] = [
      { isFinal: true, 0: { transcript: "Hola." } },
      { isFinal: true, 0: { transcript: "Mundo." } },
    ];
    expect(buildTranscript(r)).toBe("Hola. Mundo.");
  });

  it("combina una frase finalizada acumulada con una nueva frase", () => {
    const r = results("glándulas salivales inflamadas", "paciente alerta");
    expect(buildTranscript(r)).toBe("glándulas salivales inflamadas paciente alerta");
  });

  it("ignora una revisión más corta (prefijo del texto ya construido)", () => {
    const r = results("glándulas salivales", "glándulas");
    expect(buildTranscript(r)).toBe("glándulas salivales");
  });

  it("ignora una entrada duplicada al final del texto", () => {
    const r = results("glándulas salivales", "salivales");
    expect(buildTranscript(r)).toBe("glándulas salivales");
  });

  it("salta entradas vacías", () => {
    const r = results("glándulas", "", "glándulas salivales");
    expect(buildTranscript(r)).toBe("glándulas salivales");
  });

  it("salta resultados malformados sin alternativa [0]", () => {
    const r = [
      { isFinal: false } as unknown as VoiceResult,
      { isFinal: false, 0: { transcript: "glándulas salivales" } },
    ];
    expect(buildTranscript(r)).toBe("glándulas salivales");
  });
});
