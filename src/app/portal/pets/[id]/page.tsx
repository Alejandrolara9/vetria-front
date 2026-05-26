"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  getOwnerToken,
  clearOwnerToken,
  getOwnerPets,
  getPetEvents,
  getPetNotes,
  getPetReminders,
  getAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  revokeAccessRequest,
  translateEventType,
  type OwnerPet,
  type PetEvent,
  type PetNote,
  type PetReminder,
  type ClinicAccessRequest,
} from "@/services/owner-portal";

type Section = "vaccines" | "history" | "reminders" | "access";

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function petAge(birthDate: string | null): string {
  if (!birthDate) return "";
  const diff = Date.now() - new Date(birthDate).getTime();
  const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  if (years < 1) {
    const months = Math.floor(diff / (30.44 * 24 * 60 * 60 * 1000));
    return months <= 1 ? "1 mes" : `${months} meses`;
  }
  return years === 1 ? "1 año" : `${years} años`;
}

const TUTOR_SECTIONS = [
  { key: "tratamiento",             label: "Tratamiento",      highlight: false },
  { key: "recomendaciones_al_tutor", label: "Recomendaciones", highlight: false },
  { key: "proxima_consulta",        label: "Próxima consulta", highlight: true },
] as const;

function hasTutorContent(sections: Record<string, string> | null): boolean {
  if (!sections) return false;
  return TUTOR_SECTIONS.some(({ key }) => !!sections[key]?.trim());
}

export default function PortalPetDetailPage() {
  const router = useRouter();
  const { id: petId } = useParams<{ id: string }>();
  const [section, setSection] = useState<Section>("vaccines");
  const [pet, setPet] = useState<OwnerPet | null>(null);
  const [events, setEvents] = useState<PetEvent[]>([]);
  const [notes, setNotes] = useState<PetNote[]>([]);
  const [reminders, setReminders] = useState<PetReminder[]>([]);
  const [accessRequests, setAccessRequests] = useState<ClinicAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessLoading, setAccessLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!getOwnerToken()) { router.push("/portal/login"); return; }
    if (!petId) return;

    setLoading(true);
    Promise.all([
      getOwnerPets(),
      getPetEvents(petId),
      getPetNotes(petId),
      getPetReminders(petId),
      getAccessRequests(),
    ])
      .then(([pets, evts, nts, rems, accesses]) => {
        const found = pets.find((p) => p.id === petId);
        if (!found) { router.push("/portal/pets"); return; }
        setPet(found);
        setEvents(evts);
        setNotes(nts);
        setReminders(rems);
        setAccessRequests(accesses);
      })
      .catch((err: { response?: { status?: number } }) => {
        if (err.response?.status === 401) { clearOwnerToken(); router.push("/portal/login"); }
        else if (err.response?.status === 404) router.push("/portal/pets");
        else setError("Error al cargar la información");
      })
      .finally(() => setLoading(false));
  }, [petId, router]);

  const handleLogout = () => { clearOwnerToken(); router.push("/portal/login"); };

  const handleApprove = async (requestId: string) => {
    setAccessLoading(requestId);
    try {
      const updated = await approveAccessRequest(requestId);
      setAccessRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
    } catch { /* ignore */ }
    finally { setAccessLoading(null); }
  };

  const handleReject = async (requestId: string) => {
    setAccessLoading(requestId);
    try {
      await rejectAccessRequest(requestId);
      setAccessRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch { /* ignore */ }
    finally { setAccessLoading(null); }
  };

  const handleRevoke = async (requestId: string) => {
    setAccessLoading(requestId);
    try {
      const updated = await revokeAccessRequest(requestId);
      setAccessRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
    } catch { /* ignore */ }
    finally { setAccessLoading(null); }
  };

  const vaccines = events.filter((e) => e.type === "VACCINE");
  const nextVaccine = vaccines
    .filter((e) => e.nextDueDate)
    .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime())[0];

  const navItems: { key: Section; icon: string; label: string }[] = [
    { key: "vaccines",  icon: "💉", label: "Vacunas" },
    { key: "history",   icon: "📋", label: "Historial" },
    { key: "reminders", icon: "🔔", label: "Recordatorios" },
    { key: "access",    icon: "🏥", label: "Accesos" },
  ];

  const pendingCount = accessRequests.filter((r) => r.status === "PENDING").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ─── Sidebar (desktop only) ─────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-[#dcfce7] h-screen sticky top-0 bg-[#f0fdf4]">
        <div className="p-5 border-b border-[#dcfce7]">
          <div className="w-14 h-14 relative mb-3">
            <Image src="/logo.png" alt="Vetria" fill className="object-contain" />
          </div>
          <p className="font-bold text-gray-900 text-base leading-tight">{pet?.name}</p>
          <p className="text-gray-500 text-xs mt-0.5">
            {pet?.species}{pet?.breed ? ` · ${pet.breed}` : ""}
          </p>
          {pet?.birthDate && (
            <p className="text-gray-400 text-xs">{petAge(pet.birthDate)}</p>
          )}
          <p className="text-gray-400 text-xs mt-0.5">{pet?.tenant.name}</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                section === item.key
                  ? "bg-white border border-[#bbf7d0] text-green-700"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {item.key === "access" && pendingCount > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-[#dcfce7]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-900 hover:bg-white transition-all"
          >
            <span>→</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ─── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {/* Mobile header */}
        <header className="md:hidden border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <p className="font-bold text-gray-900 text-sm">{pet?.name}</p>
            <p className="text-gray-400 text-xs">{pet?.tenant.name}</p>
          </div>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-900">
            Salir
          </button>
        </header>

        <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
          {/* ─── Vaccines ──────────────────────────────────────────────── */}
          {section === "vaccines" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Vacunas</h2>

              {nextVaccine?.nextDueDate && (() => {
                const days = daysUntil(nextVaccine.nextDueDate);
                const overdue = days < 0;
                const urgent = days >= 0 && days <= 7;
                return (
                  <div className={`rounded-xl p-4 border ${
                    overdue  ? "bg-red-50 border-red-200" :
                    urgent   ? "bg-orange-50 border-orange-200" :
                               "bg-[#f0fdf4] border-[#bbf7d0]"
                  }`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                      overdue ? "text-red-600" : urgent ? "text-orange-600" : "text-green-700"
                    }`}>
                      {overdue ? "Vacuna vencida" : "Próxima vacuna"}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm">{nextVaccine.title}</p>
                      <div className={`rounded-lg px-3 py-1 text-center ${
                        overdue ? "bg-red-100" : urgent ? "bg-orange-100" : "bg-[#dcfce7]"
                      }`}>
                        {overdue ? (
                          <p className="text-red-600 text-xs font-bold">Vencida</p>
                        ) : (
                          <>
                            <p className={`text-xl font-extrabold leading-tight ${urgent ? "text-orange-600" : "text-green-600"}`}>
                              {days}
                            </p>
                            <p className={`text-[10px] ${urgent ? "text-orange-500" : "text-green-600"}`}>días</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {vaccines.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  Tu veterinaria aún no ha registrado vacunas para esta mascota.
                </p>
              ) : (
                <div className="space-y-2">
                  {vaccines.map((ev) => (
                    <div key={ev.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 text-xs font-semibold">✓ Aplicada</span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm mt-0.5 truncate">{ev.title}</p>
                          {ev.description && (
                            <p className="text-gray-500 text-xs mt-0.5">{ev.description}</p>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs whitespace-nowrap shrink-0">
                          {new Date(ev.appliedDate).toLocaleDateString("es-CO")}
                        </p>
                      </div>
                      {ev.nextDueDate && (
                        <p className="text-gray-400 text-xs mt-1.5">
                          Próxima: {new Date(ev.nextDueDate).toLocaleDateString("es-CO")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Clinical History ───────────────────────────────────────── */}
          {section === "history" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Historial clínico</h2>

              {notes.length === 0 ? (
                <p className="text-slate-500 text-sm">Sin historias clínicas aprobadas.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <p className="font-semibold text-white text-sm">
                          {note.chiefComplaint ?? "Consulta general"}
                        </p>
                        <p className="text-slate-500 text-xs whitespace-nowrap shrink-0">
                          {note.approvedAt
                            ? new Date(note.approvedAt).toLocaleDateString("es-CO")
                            : ""}
                        </p>
                      </div>

                      {hasTutorContent(note.sections) ? (
                        <div className="space-y-3">
                          {TUTOR_SECTIONS.map(({ key, label, highlight }) => {
                            const text = note.sections?.[key]?.trim();
                            if (!text) return null;
                            if (highlight) {
                              return (
                                <div key={key} className="bg-teal-600/10 border border-teal-500/30 rounded-xl px-4 py-3">
                                  <p className="text-xs font-bold text-teal-400 uppercase tracking-wide mb-1">
                                    {label}
                                  </p>
                                  <p className="text-white font-semibold text-sm leading-relaxed">{text}</p>
                                </div>
                              );
                            }
                            return (
                              <div key={key}>
                                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wide mb-1">
                                  {label}
                                </p>
                                <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm italic">
                          El veterinario registró esta consulta sin observaciones adicionales para el tutor.
                        </p>
                      )}

                      <p className="text-slate-600 text-xs mt-3">{note.tenant.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Reminders ─────────────────────────────────────────────── */}
          {section === "reminders" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Recordatorios</h2>

              {reminders.length === 0 ? (
                <p className="text-gray-400 text-sm">Sin recordatorios próximos.</p>
              ) : (
                <div className="space-y-2">
                  {reminders.map((rem) => {
                    const days = daysUntil(rem.calculatedDueDate);
                    const overdue = days < 0;
                    return (
                      <div key={rem.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {translateEventType(rem.eventType)}
                            </p>
                            {rem.notes && (
                              <p className="text-gray-400 text-xs mt-0.5">{rem.notes}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-semibold ${overdue ? "text-red-600" : days <= 7 ? "text-orange-600" : "text-gray-600"}`}>
                              {overdue ? `Hace ${Math.abs(days)} días` : days === 0 ? "Hoy" : `En ${days} días`}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {new Date(rem.calculatedDueDate).toLocaleDateString("es-CO")}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── Clinic Access ──────────────────────────────────────────── */}
          {section === "access" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Clínicas con acceso</h2>

              {accessRequests.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-6 text-center">
                  <p className="text-gray-400 text-sm">
                    Ninguna clínica externa tiene acceso al historial de {pet?.name}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accessRequests.map((req) => (
                    <div key={req.id} className="bg-white border border-gray-200 rounded-xl px-4 py-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{req.requestingTenant.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            Solicitud: {new Date(req.createdAt).toLocaleDateString("es-CO")}
                          </p>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                          req.status === "APPROVED" ? "bg-green-100 text-green-700" :
                          req.status === "PENDING"  ? "bg-orange-100 text-orange-700" :
                                                      "bg-gray-100 text-gray-500"
                        }`}>
                          {req.status === "APPROVED" ? "Acceso activo" :
                           req.status === "PENDING"  ? "Pendiente" : "Revocado"}
                        </span>
                      </div>

                      {req.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={accessLoading === req.id}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all"
                          >
                            {accessLoading === req.id ? "..." : "Aprobar"}
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={accessLoading === req.id}
                            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-xs font-semibold rounded-lg transition-all"
                          >
                            {accessLoading === req.id ? "..." : "Rechazar"}
                          </button>
                        </div>
                      )}

                      {req.status === "APPROVED" && (
                        <button
                          onClick={() => handleRevoke(req.id)}
                          disabled={accessLoading === req.id}
                          className="w-full py-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-xs font-semibold rounded-lg border border-red-200 transition-all"
                        >
                          {accessLoading === req.id ? "..." : "Revocar acceso"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ─── Mobile bottom nav ──────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors relative ${
                section === item.key ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {item.key === "access" && pendingCount > 0 && (
                <span className="absolute top-2 right-1/4 bg-orange-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
