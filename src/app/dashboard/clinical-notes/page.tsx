"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { MutableRefObject } from "react";
import ReactMarkdown from "react-markdown";
import { api } from "@/services/api";
import { AttachmentsPanel } from "@/components/AttachmentsPanel";
import {
  listClinicalNotes,
  listArchivedClinicalNotes,
  restoreClinicalNote,
  createClinicalNote,
  streamClinicalNote,
  reviewClinicalNote,
  deleteClinicalNote,
  getClinicalNoteById,
  type ClinicalNote,
  type ClinicalNoteStatus,
  type CreateClinicalNoteDto,
  type VitalSigns,
} from "@/services/clinical-notes";
import { SectionReviewPanel } from "@/components/SectionReviewPanel";
import { hasNewSectionsFormat } from "@/lib/section-utils";
import { buildTranscript } from "@/lib/voice-transcript";
import { usePagination } from "@/hooks/usePagination";
import { PaginationBar } from "@/components/PaginationBar";
import { AppointmentSuggestionModal } from "@/components/AppointmentSuggestionModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { type AppointmentSuggestion } from "@/services/clinical-notes";
import { PrescriptionFromNoteModal } from "@/components/PrescriptionFromNoteModal";
import type { MedicationItem } from "@/services/clinical-notes";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ClinicalNoteStatus, string> = {
  DRAFT: "Borrador",
  GENERATING: "Generando...",
  PENDING_REVIEW: "Pendiente revision",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  EDITED: "Editada y aprobada",
};

const STATUS_BADGE: Record<ClinicalNoteStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  GENERATING: "bg-yellow-100 text-yellow-800 animate-pulse",
  PENDING_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EDITED: "bg-green-100 text-green-800 border border-green-400",
};

const STATUS_FILTERS = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING_REVIEW", label: "Pendientes" },
  { value: "GENERATING", label: "Generando" },
  { value: "APPROVED", label: "Aprobadas" },
  { value: "EDITED", label: "Editadas" },
  { value: "REJECTED", label: "Rechazadas" },
  { value: "DRAFT", label: "Borradores" },
];

interface Pet {
  id: string;
  name: string;
  species: string;
  client: { id: string; name: string };
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ClinicalNoteStatus }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function NoteMarkdown({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none text-sm leading-relaxed">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-gray-800 mt-4 mb-1 border-b border-gray-200 pb-1">
              {children}
            </h2>
          ),
          p: ({ children }) => <p className="mb-2 text-gray-700">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
          li: ({ children }) => <li className="text-gray-700">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
          hr: () => <hr className="my-3 border-gray-200" />,
          em: ({ children }) => <em className="text-gray-500 text-xs">{children}</em>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

// ─── Streaming typing indicator ───────────────────────────────────────────────

function TypingCursor() {
  return (
    <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse align-middle" />
  );
}

// ─── Modal de creación con streaming ─────────────────────────────────────────

interface CreateModalProps {
  pets: Pet[];
  onClose: () => void;
  onCreated: (note: ClinicalNote) => void;
}

// Minimal type for Web Speech API (not fully typed in all TS versions)
type SpeechRecResult = { isFinal: boolean; [i: number]: { transcript: string } };
type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: { [i: number]: SpeechRecResult; length: number }; resultIndex: number }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start(): void;
  stop(): void;
};
type SpeechRecConstructor = new () => SpeechRec;

function getSpeechRecognition(): SpeechRecConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecConstructor; webkitSpeechRecognition?: SpeechRecConstructor }; // NOSONAR S3740 — required to access non-standard browser Speech API properties
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function useVoiceInput(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const recognitionRef = useRef<SpeechRec | null>(null) as MutableRefObject<SpeechRec | null>;

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  async function start() {
    const SR = getSpeechRecognition();
    if (!SR) return;

    setPermissionError(false);

    // Pedir permiso explícito antes de iniciar — el navegador muestra el diálogo nativo
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop()); // solo necesitamos el permiso, no el stream
    } catch {
      setPermissionError(true);
      return;
    }

    const recognition = new SR();
    recognition.lang = "es-CO";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e) => {
      onTranscript(buildTranscript(e.results));
    };

    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "permission-denied") {
        setPermissionError(true);
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return { listening, supported, permissionError, start, stop };
}

function CreateModal({ pets, onClose, onCreated }: CreateModalProps) {
  const [petSearch, setPetSearch] = useState("");
  const [showPetResults, setShowPetResults] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [showVitals, setShowVitals] = useState(false);
  const [vitals, setVitals] = useState<VitalSigns>({});
  const [phase, setPhase] = useState<"form" | "streaming" | "done">("form");
  const [streamedText, setStreamedText] = useState("");
  const [finalNote, setFinalNote] = useState<ClinicalNote | null>(null);
  const [noteSource, setNoteSource] = useState<"ai" | "fallback" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const streamBoxRef = useRef<HTMLDivElement>(null);
  const { listening, supported: voiceSupported, permissionError: micBlocked, start: startVoice, stop: stopVoice } = useVoiceInput(
    (transcript) => setRawInput(transcript)
  );

  const filteredPets = petSearch.trim()
    ? pets.filter(
        (p) =>
          p.name.toLowerCase().includes(petSearch.toLowerCase()) ||
          (p.client?.name ?? "").toLowerCase().includes(petSearch.toLowerCase())
      )
    : pets;

  // Auto-scroll mientras llegan tokens
  useEffect(() => {
    if (phase === "streaming" && streamBoxRef.current) {
      streamBoxRef.current.scrollTop = streamBoxRef.current.scrollHeight;
    }
  }, [streamedText, phase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPetId) { setError("Debes seleccionar una mascota."); return; }
    if (rawInput.trim().length < 10) { setError("La nota debe tener al menos 10 caracteres."); return; }

    setError(null);

    const dto: CreateClinicalNoteDto = {
      petId: selectedPetId,
      rawInput: rawInput.trim(),
      chiefComplaint: chiefComplaint.trim() || undefined,
      vitalSigns: Object.values(vitals).some((v) => v !== undefined) ? vitals : undefined,
    };

    try {
      const draft = await createClinicalNote(dto);
      setPhase("streaming");

      await streamClinicalNote(draft.id, {
        onToken: (text) => setStreamedText((prev) => prev + text),
        onComplete: (note, source) => {
          setFinalNote(note);
          setNoteSource(source);
          setPhase("done");
          onCreated(note);
        },
        onError: (msg) => {
          setError(msg);
          setPhase("form");
        },
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Error al crear la historia clínica.");
      setPhase("form");
    }
  }

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-xl shadow-xl w-full mx-4 overflow-hidden flex flex-col ${phase === "form" ? "max-w-xl" : "max-w-3xl"}`}
        style={{ maxHeight: "92vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Nueva Historia Clínica con IA</h2>
            {phase === "streaming" && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full animate-pulse font-medium">
                IA escribiendo...
              </span>
            )}
            {phase === "done" && noteSource === "ai" && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                ✓ Generada por IA
              </span>
            )}
            {phase === "done" && noteSource === "fallback" && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                ⚠ Plantilla base (IA no disponible)
              </span>
            )}
          </div>
          {phase === "form" && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
          )}
        </div>

        {/* Formulario */}
        {phase === "form" && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>
            )}

            {/* Mascota */}
            <div>
              <label className="block text-sm font-medium mb-1">Mascota</label>
              {selectedPetId ? (
                <div className="flex items-center justify-between px-3 py-2 border border-blue-300 rounded-lg bg-blue-50 text-sm">
                  <span className="font-medium">{selectedPet?.name} — {selectedPet?.client.name}</span>
                  <button type="button" onClick={() => { setSelectedPetId(""); setPetSearch(""); }}
                    className="text-gray-400 hover:text-red-500 ml-2 text-xs">cambiar</button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Escribe nombre de mascota o tutor..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    value={petSearch}
                    onChange={(e) => { setPetSearch(e.target.value); setShowPetResults(true); }}
                    onFocus={() => setShowPetResults(true)}
                    autoComplete="off"
                  />
                  {showPetResults && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredPets.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                      ) : (
                        filteredPets.slice(0, 8).map((p) => (
                          <button key={p.id} type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            onClick={() => { setSelectedPetId(p.id); setPetSearch(""); setShowPetResults(false); }}>
                            <span className="font-medium">{p.name}</span>
                            <span className="text-gray-400 ml-1">({p.species})</span>
                            <span className="text-gray-400 ml-1">— {p.client.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium mb-1">Motivo de consulta</label>
              <input type="text" placeholder="Ej: Vómitos recurrentes, pérdida de apetito..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} />
            </div>

            {/* Nota */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">
                  Nota del veterinario <span className="text-red-500">*</span>
                </label>
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={listening ? stopVoice : startVoice}
                    title={listening ? "Detener grabación" : "Dictar nota por voz"}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                      listening
                        ? "bg-red-50 border-red-300 text-red-600 animate-pulse"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                    {listening ? "Grabando..." : "Dictar"}
                  </button>
                )}
              </div>
              <textarea rows={5} required
                placeholder="Ej: perro 3 años, vomitando 2 días, come poco, temperatura 39.5, heces blandas, activo pero decaído..."
                className={`w-full px-3 py-2 border rounded-lg text-sm resize-none transition-colors ${
                  listening ? "border-red-300 bg-red-50/30" : "border-gray-200"
                }`}
                value={rawInput} onChange={(e) => setRawInput(e.target.value)} />
              {micBlocked ? (
                <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  El navegador bloqueó el micrófono. Haz clic en el ícono de candado o cámara (🔒) en la barra de dirección, selecciona <strong>Micrófono</strong> y cámbialo a <strong>Permitir</strong>. Luego recarga la página.
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">
                  {listening
                    ? "Hablando... el texto aparece en tiempo real. Presiona Detener cuando termines."
                    : "Escribe o dicta tu nota. La IA la expandirá en una historia clínica completa."}
                </p>
              )}
            </div>

            {/* Signos vitales */}
            <div>
              <button type="button"
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                onClick={() => setShowVitals((v) => !v)}>
                <svg className={`w-4 h-4 transition-transform ${showVitals ? "rotate-90" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Signos vitales (opcional)
              </button>
              {showVitals && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { key: "temperature", label: "Temperatura (°C)", placeholder: "38.5", step: "0.1" },
                    { key: "heartRate", label: "Frec. cardíaca (lpm)", placeholder: "80" },
                    { key: "respiratoryRate", label: "Frec. respiratoria (rpm)", placeholder: "20" },
                    { key: "weight", label: "Peso (kg)", placeholder: "12.5", step: "0.1" },
                  ].map(({ key, label, placeholder, step }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-400 mb-1">{label}</label>
                      <input type="number" step={step ?? "1"} placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={vitals[key as keyof VitalSigns] ?? ""}
                        onChange={(e) =>
                          setVitals({ ...vitals, [key]: e.target.value ? Number(e.target.value) : undefined })
                        } />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedPetId && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Archivos médicos (opcional)
                  </label>
                  <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                    Los análisis se incluyen en la nota IA
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  Radiografías o resultados de laboratorio — la IA leerá su análisis antes de generar la historia.
                </p>
                <AttachmentsPanel petId={selectedPetId} />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center justify-center gap-2">
                ✨ Generar Historia con IA
              </button>
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Streaming view */}
        {(phase === "streaming" || phase === "done") && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Info paciente */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm flex-shrink-0">
              <span className="font-medium">{selectedPet?.name}</span>
              <span className="text-gray-400 ml-2">— {selectedPet?.client.name}</span>
              {chiefComplaint && <span className="text-gray-500 ml-3">· {chiefComplaint}</span>}
            </div>

            {/* Texto streaming */}
            <div ref={streamBoxRef}
              className="flex-1 overflow-y-auto px-6 py-4 bg-white">
              {streamedText ? (
                <div className="text-sm leading-relaxed">
                  <NoteMarkdown text={streamedText} />
                  {phase === "streaming" && <TypingCursor />}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-gray-500 py-8">
                  <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Conectando con la IA...</span>
                </div>
              )}
            </div>

            {/* Acciones al terminar */}
            {phase === "done" && finalNote && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 overflow-y-auto max-h-[55vh]">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-3">{error}</div>
                )}
                {hasNewSectionsFormat(finalNote.sections as Record<string, string> | undefined) ? (
                  <SectionReviewPanel
                    sections={finalNote.sections as Record<string, string>}
                    isApproving={acting}
                    onApprove={async (finalNoteText, sections) => {
                      setActing(true);
                      setError(null);
                      try {
                        await reviewClinicalNote(finalNote.id, {
                          status: "EDITED",
                          finalNote: finalNoteText,
                          sections,
                        });
                        onClose();
                      } catch (err: unknown) {
                        const e = err as { response?: { data?: { message?: string } } };
                        setError(e.response?.data?.message || "Error al aprobar la historia.");
                        setActing(false);
                      }
                    }}
                    onSaveAsDraft={onClose}
                  />
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-3">
                      Historia generada. Puedes aprobarla directamente o revisarla en detalle.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await reviewClinicalNote(finalNote.id, { status: "APPROVED" });
                            onClose();
                          } catch (err: unknown) {
                            const e = err as { response?: { data?: { message?: string } } };
                            setError(e.response?.data?.message || "Error al aprobar la historia.");
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                        Aprobar historia
                      </button>
                      <button onClick={onClose}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-100">
                        Revisar después
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal de detalle ─────────────────────────────────────────────────────────

interface DetailModalProps {
  note: ClinicalNote;
  onClose: () => void;
  onUpdated: () => void;
}

function DetailModal({ note: initialNote, onClose, onUpdated }: DetailModalProps) {
  const [note, setNote] = useState<ClinicalNote>(initialNote);
  const [editedText, setEditedText] = useState(initialNote.finalNote ?? initialNote.generatedNote ?? "");
  const [vetFeedback, setVetFeedback] = useState("");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [appointmentSuggestion, setAppointmentSuggestion] = useState<AppointmentSuggestion | null>(null);
  const [pendingMedications, setPendingMedications] = useState<MedicationItem[] | null>(null);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }, []);

  useEffect(() => {
    if (note.status === "GENERATING" || note.status === "DRAFT") {
      pollingRef.current = setInterval(async () => {
        try {
          const updated = await getClinicalNoteById(note.id);
          setNote(updated);
          setEditedText(updated.finalNote ?? updated.generatedNote ?? "");
          if (updated.status !== "GENERATING" && updated.status !== "DRAFT") stopPolling();
        } catch { /* silencioso */ }
      }, 3000);
    }
    return stopPolling;
  }, [note.id, note.status, stopPolling]);

  async function handleApprove() {
    setActing(true); setError(null);
    try {
      const result = await reviewClinicalNote(note.id, { status: "APPROVED" });
      if (result.suggestion) {
        setAppointmentSuggestion(result.suggestion);
        if (result.medications?.length) setPendingMedications(result.medications);
        setActing(false);
      } else if (result.medications?.length) {
        setPendingMedications(result.medications);
        setActing(false);
      } else {
        onUpdated(); onClose();
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Error al aprobar."); setActing(false);
    }
  }

  async function handleEditAndApprove() {
    if (!editedText.trim()) { setError("El texto no puede estar vacío."); return; }
    setActing(true); setError(null);
    try {
      const result = await reviewClinicalNote(note.id, { status: "EDITED", finalNote: editedText.trim(), vetFeedback: vetFeedback.trim() || undefined });
      if (result.suggestion) {
        setAppointmentSuggestion(result.suggestion);
        if (result.medications?.length) setPendingMedications(result.medications);
        setActing(false);
      } else if (result.medications?.length) {
        setPendingMedications(result.medications);
        setActing(false);
      } else {
        onUpdated(); onClose();
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Error al guardar."); setActing(false);
    }
  }

  async function handleReject() {
    setRejectConfirmOpen(true);
  }

  async function doReject() {
    setRejectConfirmOpen(false);
    setActing(true); setError(null);
    try {
      await reviewClinicalNote(note.id, { status: "REJECTED", vetFeedback: vetFeedback.trim() || undefined });
      onUpdated(); onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Error al rechazar."); setActing(false);
    }
  }

  async function handleDelete() {
    setArchiveConfirmOpen(true);
  }

  async function doDelete() {
    setArchiveConfirmOpen(false);
    setActing(true);
    try {
      await deleteClinicalNote(note.id);
      onUpdated(); onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Error al eliminar."); setActing(false);
    }
  }

  const isReadOnly = note.status === "APPROVED" || note.status === "EDITED";
  const isPendingReview = note.status === "PENDING_REVIEW";
  const isGenerating = note.status === "GENERATING" || note.status === "DRAFT";
  const isRejected = note.status === "REJECTED";
  const noteText = note.finalNote ?? note.generatedNote ?? "";
  const hasStructuredSections = hasNewSectionsFormat(note.sections as Record<string, string> | undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col" style={{ maxHeight: "92vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Historia Clínica — {note.pet?.name}</h2>
            <StatusBadge status={note.status} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>
          )}

          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Mascota</p>
              <p className="font-medium">{note.pet?.name}</p>
              <p className="text-gray-400">{note.pet?.species}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha</p>
              <p className="font-medium">{new Date(note.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Veterinario tratante</p>
              <p className="font-medium">{note.author?.name ?? "—"}</p>
            </div>
            {note.approvedByVet?.name && (
              <div>
                <p className="text-xs text-gray-400">Aprobado por</p>
                <p className="font-medium">{note.approvedByVet.name}</p>
              </div>
            )}
          </div>

          {note.chiefComplaint && (
            <div className="text-sm">
              <p className="text-xs text-gray-400 mb-1">Motivo de consulta</p>
              <p className="font-medium">{note.chiefComplaint}</p>
            </div>
          )}

          <div className="text-sm">
            <p className="text-xs text-gray-400 mb-1">Nota original del veterinario</p>
            <p className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-500 italic">{note.rawInput}</p>
          </div>

          {/* Generando */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <svg className="w-10 h-10 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <div>
                <p className="font-medium text-yellow-800">La IA está generando la historia clínica...</p>
                <p className="text-xs text-gray-400 mt-1">La página se actualizará automáticamente.</p>
              </div>
            </div>
          )}

          {/* Historia en revisión — secciones estructuradas o fallback markdown */}
          {isPendingReview && !isGenerating && (
            <div className="text-sm">
              {hasStructuredSections ? (
                <SectionReviewPanel
                  sections={note.sections as Record<string, string>}
                  isApproving={acting}
                  onApprove={async (finalNoteText, sections) => {
                    setActing(true);
                    setError(null);
                    try {
                      const result = await reviewClinicalNote(note.id, {
                        status: "EDITED",
                        finalNote: finalNoteText,
                        sections,
                      });
                      if (result.suggestion) {
                        setAppointmentSuggestion(result.suggestion);
                        if (result.medications?.length) setPendingMedications(result.medications);
                        setActing(false);
                      } else if (result.medications?.length) {
                        setPendingMedications(result.medications);
                        setActing(false);
                      } else {
                        onUpdated();
                        onClose();
                      }
                    } catch (err: unknown) {
                      const e = err as { response?: { data?: { message?: string } } };
                      setError(e.response?.data?.message || "Error al aprobar.");
                      setActing(false);
                    }
                  }}
                  onSaveAsDraft={onClose}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">Historia clínica generada por IA — revisa y edita si es necesario</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setViewMode("preview")}
                        className={`text-xs px-2 py-1 rounded ${viewMode === "preview" ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}>
                        Vista
                      </button>
                      <button
                        onClick={() => setViewMode("edit")}
                        className={`text-xs px-2 py-1 rounded ${viewMode === "edit" ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}>
                        Editar
                      </button>
                    </div>
                  </div>
                  {viewMode === "preview" ? (
                    <div className="border border-gray-200 rounded-lg px-4 py-3 bg-white max-h-80 overflow-y-auto">
                      <NoteMarkdown text={editedText || noteText} />
                    </div>
                  ) : (
                    <textarea
                      rows={16}
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Historia aprobada — solo lectura */}
          {isReadOnly && noteText && (
            <div className="text-sm">
              <p className="text-xs text-gray-400 mb-2">Historia clínica (aprobada)</p>
              <div className="border border-gray-200 rounded-lg px-4 py-3 bg-white max-h-80 overflow-y-auto">
                <NoteMarkdown text={editedText || noteText} />
              </div>
            </div>
          )}

          {/* Feedback — solo para notas sin secciones estructuradas */}
          {isPendingReview && !hasStructuredSections && (
            <div className="text-sm">
              <label className="block text-xs text-gray-400 mb-1">
                Comentarios para mejorar (opcional)
              </label>
              <textarea rows={2}
                placeholder="Ej: Agregar diagnóstico diferencial más detallado..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                value={vetFeedback} onChange={(e) => setVetFeedback(e.target.value)} />
            </div>
          )}

          {/* Botones de revisión — solo para notas sin secciones estructuradas */}
          {isPendingReview && !hasStructuredSections && (
            <div className="flex gap-2 pt-2 flex-wrap">
              <button onClick={handleApprove} disabled={acting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 font-medium">
                {acting ? "Procesando..." : "✓ Aprobar"}
              </button>
              <button onClick={handleEditAndApprove} disabled={acting}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 font-medium">
                {acting ? "Guardando..." : "Guardar edición y aprobar"}
              </button>
              <button onClick={handleReject} disabled={acting}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50">
                Rechazar
              </button>
            </div>
          )}

          {/* Motivo de rechazo */}
          {isRejected && note.vetFeedback && (
            <div className="text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-xs font-medium text-red-700 mb-1">Motivo de rechazo</p>
              <p className="text-red-800">{note.vetFeedback}</p>
            </div>
          )}

          <div className="pt-1 border-t border-gray-100">
            <button onClick={handleDelete} disabled={acting}
              className="text-xs text-gray-400 hover:text-amber-600 disabled:opacity-50">
              Archivar historia clínica
            </button>
          </div>
        </div>
      </div>
      {appointmentSuggestion && (
        <AppointmentSuggestionModal
          suggestion={appointmentSuggestion}
          petId={note.petId}
          clientId={note.pet?.client?.id ?? ""}
          vetId={note.author?.id ?? ""}
          onClose={() => {
            setAppointmentSuggestion(null);
            if (!pendingMedications?.length) {
              onUpdated();
              onClose();
            }
          }}
        />
      )}
      {pendingMedications && !appointmentSuggestion && (
        <PrescriptionFromNoteModal
          medications={pendingMedications}
          petId={note.petId}
          vetId={note.author?.id ?? ""}
          clinicalNoteId={note.id}
          onClose={() => {
            setPendingMedications(null);
            onUpdated();
            onClose();
          }}
        />
      )}
      <ConfirmDialog
        open={rejectConfirmOpen}
        title="¿Rechazar esta historia clínica?"
        variant="danger"
        loading={acting}
        onConfirm={doReject}
        onClose={() => setRejectConfirmOpen(false)}
      />
      <ConfirmDialog
        open={archiveConfirmOpen}
        title="¿Archivar esta historia clínica?"
        description="Podrás recuperarla desde 'Ver archivadas'."
        variant="danger"
        loading={acting}
        onConfirm={doDelete}
        onClose={() => setArchiveConfirmOpen(false)}
      />
    </div>
  );
}

// ─── Lista de archivadas (paginada, carga perezosa) ────────────────────────────

function ArchivedNotesList({ onRestored }: { onRestored: () => void }) {
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchArchived = useCallback(
    (page: number, limit: number, search: string, signal: AbortSignal) =>
      listArchivedClinicalNotes(page, limit, search, signal),
    [refreshKey]
  );

  const { data: archivedNotes, total, page, totalPages, loading, setPage } =
    usePagination<ClinicalNote>({ fetchFn: fetchArchived });

  async function handleRestore(id: string) {
    setRestoringId(id);
    setRestoreError(null);
    try {
      await restoreClinicalNote(id);
      setRefreshKey((k) => k + 1); // refresca esta lista de archivadas
      onRestored();                // refresca la lista de activas en el padre
    } catch {
      setRestoreError("No se pudo restaurar la nota. Intenta de nuevo.");
    } finally { setRestoringId(null); }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-semibold text-amber-700">Historias archivadas</span>
        <span className="text-xs text-gray-400">({total})</span>
      </div>
      {restoreError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-3">{restoreError}</div>
      )}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-amber-50 rounded-xl border border-amber-100 p-5 animate-pulse">
              <div className="h-4 bg-amber-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-amber-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : archivedNotes.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No hay historias archivadas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archivedNotes.map((note) => (
            <div key={note.id} className="bg-amber-50 rounded-xl border border-amber-100 p-5 opacity-80">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm text-gray-600">{note.pet?.name ?? "Mascota"}</p>
                  <p className="text-xs text-gray-400">{note.pet?.species}</p>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Archivada</span>
              </div>
              {note.chiefComplaint && (
                <p className="text-sm text-gray-500 mb-1 line-clamp-1">{note.chiefComplaint}</p>
              )}
              <p className="text-xs text-gray-400 line-clamp-2 italic mb-3">{note.rawInput}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-300">
                  {new Date(note.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <button
                  onClick={() => handleRestore(note.id)}
                  disabled={restoringId === note.id}
                  className="text-xs text-amber-700 hover:text-amber-900 font-medium border border-amber-300 px-2 py-1 rounded-lg hover:bg-amber-100 disabled:opacity-50 transition-colors"
                >
                  {restoringId === note.id ? "Restaurando..." : "Restaurar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <PaginationBar page={page} totalPages={totalPages} total={total} onPageChange={setPage} loading={loading} />
      <hr className="mt-6 border-gray-100" />
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ClinicalNotesPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // fetchFn server-side: cierra sobre statusFilter y refreshKey (este último
  // fuerza un refetch tras crear/editar/restaurar sin cambiar de página).
  const fetchNotes = useCallback(
    (page: number, limit: number, search: string, signal: AbortSignal) =>
      listClinicalNotes(page, limit, search, signal, statusFilter),
    [statusFilter, refreshKey]
  );

  const {
    data: notes,
    total,
    page,
    totalPages,
    search,
    loading,
    setSearch,
    setPage,
  } = usePagination<ClinicalNote>({ fetchFn: fetchNotes });

  useEffect(() => {
    api.get<Pet[]>("/pets").then((r) => setPets(r.data)).catch(() => setPets([]));
  }, []);

  const refreshNotes = () => setRefreshKey((k) => k + 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Historias Clínicas</h1>
          <p className="text-gray-400 text-sm mt-1">{total} registros · asistidas por IA</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowArchived((v) => !v)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showArchived
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>
            {showArchived ? "Ver activas" : "Ver archivadas"}
          </button>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2">
            ✨ Nueva Historia con IA
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input type="text" placeholder="Buscar por mascota, motivo o nota..."
          className="w-full sm:max-w-xs px-4 py-2 border border-gray-200 rounded-lg text-sm"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                statusFilter === f.value ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Archivadas (carga perezosa + paginación propia) */}
      {showArchived && <ArchivedNotesList onRestored={refreshNotes} />}

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No se encontraron historias clínicas</p>
          <button onClick={() => setShowCreate(true)} className="mt-3 text-blue-600 text-sm hover:underline">
            Crear la primera
          </button>
        </div>
      ) : (
        <>
          {/* Móvil: tarjetas */}
          <div className="md:hidden space-y-3">
            {notes.map((note) => (
              <button key={note.id} onClick={() => setSelectedNote(note)}
                className="w-full bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm">{note.pet?.name ?? "Mascota"}</p>
                    <p className="text-xs text-gray-400">{note.pet?.species}</p>
                  </div>
                  <StatusBadge status={note.status} />
                </div>
                {note.chiefComplaint && (
                  <p className="text-sm font-medium mb-1 line-clamp-1">{note.chiefComplaint}</p>
                )}
                <p className="text-xs text-gray-400 line-clamp-2 italic">{note.rawInput}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-300">
                    {new Date(note.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {note.author?.name && (
                    <p className="text-xs text-gray-400">Dr. {note.author?.name}</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Paciente</th>
                  <th className="px-4 py-3 text-left">Motivo de consulta</th>
                  <th className="px-4 py-3 text-left">Veterinario</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notes.map((note) => (
                  <tr key={note.id} onClick={() => setSelectedNote(note)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-medium">{note.pet?.name ?? "Mascota"}</p>
                      <p className="text-xs text-gray-400">{note.pet?.species}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <span className="line-clamp-1">{note.chiefComplaint || <span className="text-gray-300 italic">Sin motivo</span>}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{note.author?.name ? `Dr. ${note.author.name}` : "—"}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={note.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        title="Ver historia">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        loading={loading}
      />

      {showCreate && (
        <CreateModal
          pets={pets}
          onClose={() => setShowCreate(false)}
          onCreated={(note) => {
            refreshNotes();
            setShowCreate(false);
            setSelectedNote(note);
          }}
        />
      )}

      {selectedNote && (
        <DetailModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onUpdated={() => { setSelectedNote(null); refreshNotes(); }}
        />
      )}
    </div>
  );
}
