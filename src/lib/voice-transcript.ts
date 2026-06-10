// Lógica pura para construir el texto dictado a partir de los resultados del
// Web Speech API. Se extrae aquí para poder probarla y para corregir el bug de
// duplicación en móvil (Chrome Android crea una entrada nueva por cada
// actualización interina en vez de reemplazar la misma, por lo que concatenar
// todas las entradas triplica la frase).

export type VoiceResult = {
  isFinal: boolean;
  [i: number]: { transcript: string };
};

export type CollectTranscriptOutput = {
  /** Texto final acumulado (debe persistirse entre eventos onresult). */
  finalText: string;
  /** Texto a mostrar = final acumulado + último interino, recortado. */
  display: string;
};

/**
 * Construye el transcript a partir de un evento onresult.
 *
 * @param results     Lista de resultados del evento (e.results).
 * @param resultIndex Índice del primer resultado nuevo (e.resultIndex).
 * @param priorFinal  Texto final acumulado de eventos anteriores.
 *
 * Recorre solo desde resultIndex (resultados nuevos), anexa los finales al
 * acumulado persistente y se queda únicamente con el ÚLTIMO interino (lo
 * reemplaza, no lo concatena), evitando la duplicación en móvil.
 */
export function collectTranscript(
  results: ArrayLike<VoiceResult>,
  resultIndex: number,
  priorFinal: string
): CollectTranscriptOutput {
  let finalText = priorFinal;
  let interim = "";

  for (let i = resultIndex; i < results.length; i++) {
    const r = results[i];
    if (r.isFinal) {
      finalText += r[0].transcript;
    } else {
      interim = r[0].transcript;
    }
  }

  return { finalText, display: (finalText + interim).trim() };
}
