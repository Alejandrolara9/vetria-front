// Lógica pura para construir el texto dictado a partir de los resultados del
// Web Speech API. Se extrae aquí para poder probarla y para corregir el bug de
// duplicación/triplicado en móvil.
//
// Causa raíz: en Chrome Android, al dictar con el Web Speech API el evento
// onresult reenvía la frase acumulada como entradas SEPARADAS y crecientes
// (cada actualización es un prefijo más largo de la anterior), en lugar de
// reemplazar la misma entrada como hace el escritorio. Cualquier enfoque que
// concatene las entradas — o que mantenga un acumulador persistente entre
// eventos cuando resultIndex no avanza — termina repitiendo el texto
// ("glándulasglándulas salivalesglándulas salivales...").
//
// Solución robusta e independiente del flag isFinal / resultIndex:
// reconstruir el texto DESDE CERO en cada evento a partir de e.results,
// colapsando los prefijos crecientes y los duplicados, y uniendo con un
// espacio solo las frases genuinamente distintas.

export type VoiceResult = {
  isFinal: boolean;
  [i: number]: { transcript: string };
};

/**
 * Construye el texto dictado a partir de la lista completa de resultados del
 * evento onresult (e.results). Es puro y sin estado: en cada evento se debe
 * pasar la lista completa y usar el valor devuelto tal cual.
 */
export function buildTranscript(results: ArrayLike<VoiceResult>): string {
  let out = "";

  for (const result of Array.from(results)) {
    const t = result?.[0]?.transcript ?? "";
    if (!t) continue;

    if (out === "") {
      out = t;
      continue;
    }
    if (t === out) continue; // entrada idéntica
    if (t.startsWith(out)) {
      out = t; // la entrada extiende lo ya construido (prefijo creciente)
      continue;
    }
    if (out.startsWith(t)) continue; // revisión más corta: conservar lo más largo
    if (out.endsWith(t)) continue; // la entrada ya está al final del texto

    out = `${out} ${t}`; // frase genuinamente nueva
  }

  return out.trim();
}
