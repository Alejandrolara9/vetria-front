import { collectTranscript, type VoiceResult } from "../../lib/voice-transcript";

// Helpers para construir un SpeechRecognitionResultList simulado
function result(transcript: string, isFinal: boolean): VoiceResult {
  return { isFinal, 0: { transcript } };
}

describe("collectTranscript", () => {
  it("escritorio: una entrada interina que se actualiza en su sitio no se duplica", () => {
    // Chrome escritorio reutiliza el mismo índice; resultIndex apunta a esa entrada
    let acc = "";

    let out = collectTranscript([result("glándulas", false)], 0, acc);
    expect(out.display).toBe("glándulas");
    acc = out.finalText;

    out = collectTranscript([result("glándulas salivales inflamadas", false)], 0, acc);
    expect(out.display).toBe("glándulas salivales inflamadas");
    acc = out.finalText;

    out = collectTranscript([result("glándulas salivales inflamadas", true)], 0, acc);
    expect(out.display).toBe("glándulas salivales inflamadas");
  });

  it("móvil: entradas interinas acumuladas no se concatenan (sin triplicado)", () => {
    // Chrome Android crea una entrada nueva por cada actualización interina.
    // El bucle debe quedarse solo con el último interino, no sumar todas.
    const results = [
      result("glándulas", false),
      result("glándulas salivales", false),
      result("glándulas salivales inflamadas", false),
    ];

    const out = collectTranscript(results, 0, "");

    expect(out.display).toBe("glándulas salivales inflamadas");
  });

  it("acumula los resultados finales entre eventos sucesivos", () => {
    // Primer evento finaliza una frase
    let out = collectTranscript([result("Hola.", true)], 0, "");
    expect(out.finalText).toBe("Hola.");

    // Segundo evento: resultIndex avanza, nuevo final se anexa al previo
    out = collectTranscript(
      [result("Hola.", true), result(" Mundo.", true)],
      1,
      out.finalText
    );
    expect(out.finalText).toBe("Hola. Mundo.");
    expect(out.display).toBe("Hola. Mundo.");
  });

  it("combina final persistido + interino en vivo en el display", () => {
    const out = collectTranscript(
      [result("Frase final. ", true), result("dictando ahora", false)],
      0,
      ""
    );
    expect(out.finalText).toBe("Frase final. ");
    expect(out.display).toBe("Frase final. dictando ahora");
  });

  it("recorta espacios sobrantes del display", () => {
    const out = collectTranscript([result("  texto  ", false)], 0, "");
    expect(out.display).toBe("texto");
  });

  it("usa resultIndex para ignorar resultados ya procesados", () => {
    // result[0] ya se procesó en un evento anterior (acc lo contiene);
    // este evento solo trae result[1], así que resultIndex=1 evita reprocesar.
    const out = collectTranscript(
      [result("primero", true), result("segundo", false)],
      1,
      "primero"
    );
    expect(out.display).toBe("primerosegundo");
  });
});
