import { api } from "./api";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ClinicalNoteStatus =
  | "DRAFT"
  | "GENERATING"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EDITED";

export interface VitalSigns {
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  weight?: number;
}

export interface ClinicalNote {
  id: string;
  petId: string;
  status: ClinicalNoteStatus;
  chiefComplaint?: string;
  rawInput: string;
  generatedNote?: string;
  /** Secciones estructuradas devueltas por la IA (objeto libre) */
  sections?: Record<string, string>;
  vitalSigns?: VitalSigns;
  symptoms?: string[];
  vetFeedback?: string;
  finalNote?: string;
  pet?: {
    id: string;
    name: string;
    species: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateClinicalNoteDto {
  petId: string;
  rawInput: string;
  chiefComplaint?: string;
  vitalSigns?: VitalSigns;
  symptoms?: string[];
}

export interface ReviewClinicalNoteDto {
  status: "APPROVED" | "EDITED" | "REJECTED";
  finalNote?: string;
  vetFeedback?: string;
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Crea un borrador de historia clínica y dispara la generación por IA en el backend.
 * El backend crea el registro con status DRAFT y de forma asíncrona pasa a GENERATING
 * y luego a PENDING_REVIEW cuando la IA termina.
 */
export async function createClinicalNote(dto: CreateClinicalNoteDto): Promise<ClinicalNote> {
  const res = await api.post<ClinicalNote>("/clinical-notes", dto);
  return res.data;
}

/**
 * Dispara manualmente la generación de IA para una nota ya creada.
 * Cambia el status a GENERATING y luego a PENDING_REVIEW al completarse.
 */
export async function generateClinicalNote(id: string): Promise<ClinicalNote> {
  const res = await api.post<ClinicalNote>(`/clinical-notes/${id}/generate`);
  return res.data;
}

/**
 * Revisa (aprueba, edita o rechaza) una historia clínica en estado PENDING_REVIEW.
 */
export async function reviewClinicalNote(
  id: string,
  dto: ReviewClinicalNoteDto
): Promise<ClinicalNote> {
  const res = await api.patch<ClinicalNote>(`/clinical-notes/${id}/review`, dto);
  return res.data;
}

/** Lista todas las historias clínicas del tenant. */
export async function listClinicalNotes(): Promise<ClinicalNote[]> {
  const res = await api.get<ClinicalNote[]>("/clinical-notes");
  return res.data;
}

/** Obtiene las historias de una mascota específica. */
export async function getClinicalNotesByPet(petId: string): Promise<ClinicalNote[]> {
  const res = await api.get<ClinicalNote[]>(`/clinical-notes/pet/${petId}`);
  return res.data;
}

/** Obtiene el detalle de una historia clínica por su id. */
export async function getClinicalNoteById(id: string): Promise<ClinicalNote> {
  const res = await api.get<ClinicalNote>(`/clinical-notes/${id}`);
  return res.data;
}

/** Realiza soft-delete de una historia clínica. */
export async function deleteClinicalNote(id: string): Promise<void> {
  await api.delete(`/clinical-notes/${id}`);
}

/**
 * Consume el stream SSE de generación de historia clínica.
 * Llama a onToken por cada fragmento de texto recibido.
 * Llama a onComplete cuando la IA termina con la nota final.
 * Llama a onError si hay un error.
 */
export async function streamClinicalNote(
  id: string,
  callbacks: {
    onToken: (text: string) => void;
    onComplete: (note: ClinicalNote) => void;
    onError: (msg: string) => void;
  }
): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
  const token = localStorage.getItem("token");

  const response = await fetch(`${apiUrl}/clinical-notes/${id}/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
  });

  if (!response.ok || !response.body) {
    callbacks.onError("Error al conectar con el servidor de IA");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.type === "token") {
          callbacks.onToken(event.text);
        } else if (event.type === "complete") {
          callbacks.onComplete(event.note);
        } else if (event.type === "error") {
          callbacks.onError(event.message);
        }
      } catch {
        // Ignorar líneas mal formadas
      }
    }
  }
}
