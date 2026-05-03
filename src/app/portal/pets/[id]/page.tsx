"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getOwnerToken,
  clearOwnerToken,
  getPetEvents,
  getPetNotes,
  getPetReminders,
  translateEventType,
  type PetEvent,
  type PetNote,
  type PetReminder,
} from "@/services/owner-portal";

type Tab = "events" | "notes" | "reminders";

export default function PortalPetDetailPage() {
  const router = useRouter();
  const { id: petId } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("events");
  const [events, setEvents] = useState<PetEvent[]>([]);
  const [notes, setNotes] = useState<PetNote[]>([]);
  const [reminders, setReminders] = useState<PetReminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getOwnerToken()) { router.push("/portal/login"); return; }
  }, [router]);

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    setError("");
    const fetchData =
      tab === "events"    ? getPetEvents(petId) :
      tab === "notes"     ? getPetNotes(petId)  :
                            getPetReminders(petId);

    fetchData
      .then((data) => {
        if (tab === "events")    setEvents(data as PetEvent[]);
        if (tab === "notes")     setNotes(data as PetNote[]);
        if (tab === "reminders") setReminders(data as PetReminder[]);
      })
      .catch((err: { response?: { status?: number } }) => {
        if (err.response?.status === 401) { clearOwnerToken(); router.push("/portal/login"); }
        else if (err.response?.status === 404) router.push("/portal/pets");
        else setError("Error al cargar la información");
      })
      .finally(() => setLoading(false));
  }, [tab, petId, router]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "events", label: "Eventos" },
    { key: "notes", label: "Historias clínicas" },
    { key: "reminders", label: "Recordatorios" },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/portal/pets" className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="font-bold text-white">Historial de salud</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-slate-400 text-sm">Cargando...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && tab === "events" && (
          <div className="space-y-3">
            {events.length === 0 && (
              <p className="text-slate-500 text-sm">Sin eventos registrados.</p>
            )}
            {events.map((ev) => (
              <div key={ev.id} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white text-sm">{ev.title}</p>
                    <p className="text-blue-400 text-xs mt-0.5">{translateEventType(ev.type)}</p>
                    {ev.description && (
                      <p className="text-slate-400 text-xs mt-1">{ev.description}</p>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs whitespace-nowrap">
                    {new Date(ev.appliedDate).toLocaleDateString("es-CO")}
                  </p>
                </div>
                {ev.nextDueDate && (
                  <p className="text-slate-500 text-xs mt-2">
                    Próximo: {new Date(ev.nextDueDate).toLocaleDateString("es-CO")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "notes" && (
          <div className="space-y-3">
            {notes.length === 0 && (
              <p className="text-slate-500 text-sm">Sin historias clínicas aprobadas.</p>
            )}
            {notes.map((note) => (
              <div key={note.id} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-white text-sm">
                    {note.chiefComplaint ?? "Consulta general"}
                  </p>
                  <p className="text-slate-500 text-xs whitespace-nowrap">
                    {note.approvedAt
                      ? new Date(note.approvedAt).toLocaleDateString("es-CO")
                      : ""}
                  </p>
                </div>
                {note.finalNote && (
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-4">
                    {note.finalNote}
                  </p>
                )}
                <p className="text-slate-500 text-xs mt-2">{note.tenant.name}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "reminders" && (
          <div className="space-y-3">
            {reminders.length === 0 && (
              <p className="text-slate-500 text-sm">Sin recordatorios próximos.</p>
            )}
            {reminders.map((rem) => (
              <div key={rem.id} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white text-sm">
                      {translateEventType(rem.eventType)}
                    </p>
                    {rem.notes && (
                      <p className="text-slate-400 text-xs mt-1">{rem.notes}</p>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs whitespace-nowrap font-medium">
                    {new Date(rem.calculatedDueDate).toLocaleDateString("es-CO")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
