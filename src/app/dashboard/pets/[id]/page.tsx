"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttachmentsPanel } from "@/components/AttachmentsPanel";
import { listAttachments, type Attachment } from "@/services/attachments";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ClinicalEvent {
  id: string;
  type: string;
  title: string;
  appliedDate: string;
  nextDueDate: string | null;
  description: string | null;
}

interface Appointment {
  id: string;
  title: string;
  date: string;
  startTime: string;
  status: string;
  notes: string | null;
  vet: { id: string; name: string } | null;
}

interface ClinicalNote {
  id: string;
  status: string;
  chiefComplaint: string | null;
  rawInput: string;
  createdAt: string;
  author: { id: string; name: string } | null;
}

interface Reminder {
  id: string;
  eventType: string;
  status: string;
  calculatedDueDate: string;
  aiReasoning: string | null;
}

interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string;
  birthDate: string | null;
  client: { id: string; name: string; phone: string; email: string };
  clinicalEvents: ClinicalEvent[];
  appointments: Appointment[];
  clinicalNotes: ClinicalNote[];
  reminders: Reminder[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(birthDate: string): string {
  const ms = Date.now() - new Date(birthDate).getTime();
  const years = ms / (365.25 * 24 * 60 * 60 * 1000);
  if (years < 1) {
    const months = Math.floor(ms / (30.44 * 24 * 60 * 60 * 1000));
    return `${months} mes${months !== 1 ? "es" : ""}`;
  }
  const y = Math.floor(years);
  return `${y} año${y !== 1 ? "s" : ""}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function daysFromNow(d: string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const EVENT_LABELS: Record<string, string> = {
  VACCINE: "Vacuna", DEWORMING: "Desparasitación",
  ANTIPARASITIC: "Antiparasitario", CHECKUP: "Control", OTHER: "Otro",
};

const APPT_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Agendada", CONFIRMED: "Confirmada",
  COMPLETED: "Completada", CANCELLED: "Cancelada", NO_SHOW: "No se presentó",
};

const NOTE_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador", GENERATING: "Generando",
  PENDING_REVIEW: "Por revisar", APPROVED: "Aprobada",
  EDITED: "Editada", REJECTED: "Rechazada",
};

const SPECIES_EMOJI: Record<string, string> = {
  Canino: "🐕", Felino: "🐈", Ave: "🦜", Reptil: "🦎",
  Conejo: "🐇", Cobayo: "🐹", Hámster: "🐹", Pez: "🐟",
};

function eventBadgeVariant(type: string): "default" | "secondary" | "outline" {
  if (type === "VACCINE") return "default";
  if (type === "DEWORMING" || type === "ANTIPARASITIC") return "secondary";
  return "outline";
}

function apptBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "COMPLETED") return "secondary";
  if (status === "CANCELLED" || status === "NO_SHOW") return "destructive";
  if (status === "CONFIRMED") return "default";
  return "outline";
}

function noteBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "APPROVED" || status === "EDITED") return "default";
  if (status === "PENDING_REVIEW") return "secondary";
  if (status === "REJECTED") return "destructive";
  return "outline";
}

function DaysChip({ dueDate }: { dueDate: string }) {
  const days = daysFromNow(dueDate);
  if (days < 0)
    return <span className="text-xs font-semibold text-destructive">Vencido hace {Math.abs(days)}d</span>;
  if (days === 0)
    return <span className="text-xs font-semibold text-orange-600">Hoy</span>;
  if (days <= 30)
    return <span className="text-xs font-semibold text-orange-500">En {days}d</span>;
  return <span className="text-xs text-muted-foreground">En {days}d</span>;
}

// ─── Skeleton de carga ────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Skeleton className="h-4 w-40" />
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-5">
            <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "resumen" | "citas" | "eventos" | "historias" | "recordatorios" | "attachments";

const TABS: { id: Tab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "citas", label: "Citas" },
  { id: "eventos", label: "Eventos Clínicos" },
  { id: "historias", label: "Historias Clínicas" },
  { id: "recordatorios", label: "Recordatorios" },
  { id: "attachments", label: "Archivos médicos" },
];

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PetProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("resumen");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    api.get<PetProfile>(`/pets/${id}/profile`)
      .then(async (r) => {
        setPet(r.data);
        const atts = await listAttachments(id as string);
        setAttachments(atts);
      })
      .catch(() => setError("No se pudo cargar el expediente. Verifica tu conexión."))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <ProfileSkeleton />;

  if (error || !pet) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="border-destructive/40">
          <CardContent className="p-8 text-center">
            <p className="text-destructive font-medium">{error ?? "Mascota no encontrada."}</p>
            <Link href="/dashboard/pets" className="text-sm text-muted-foreground mt-2 hover:underline block">
              ← Volver a mascotas
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingNotes = pet.clinicalNotes.filter((n) => n.status === "PENDING_REVIEW").length;
  const nextReminder = pet.reminders
    .filter((r) => r.status === "SCHEDULED" || r.status === "PENDING")
    .sort((a, b) => new Date(a.calculatedDueDate).getTime() - new Date(b.calculatedDueDate).getTime())[0];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/pets" className="hover:text-foreground transition-colors">Mascotas</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{pet.name}</span>
      </nav>

      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl flex-shrink-0 select-none">
              {SPECIES_EMOJI[pet.species] ?? "🐾"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{pet.name}</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {pet.sex} · {pet.breed ?? pet.species}
                    {pet.birthDate ? ` · ${calcAge(pet.birthDate)}` : ""}
                  </p>
                </div>
                <Link
                  href={`/dashboard/appointments?petId=${pet.id}`}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                  + Nueva cita
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <StatChip icon="📋" label="citas" value={pet.appointments.length} />
                <StatChip icon="💉" label="eventos" value={pet.clinicalEvents.length} />
                <StatChip icon="📄" label="historias" value={pet.clinicalNotes.length} />
                {pendingNotes > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    ⚠ {pendingNotes} historia{pendingNotes > 1 ? "s" : ""} pendiente{pendingNotes > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Tutor + próximo recordatorio */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <InfoField label="Tutor">
              <Link href={`/dashboard/clients`} className="font-medium text-primary hover:underline">
                {pet.client.name}
              </Link>
            </InfoField>
            {pet.client.phone && <InfoField label="Teléfono"><span className="font-medium">{pet.client.phone}</span></InfoField>}
            {pet.client.email && <InfoField label="Email"><span className="font-medium">{pet.client.email}</span></InfoField>}
            {nextReminder && (
              <InfoField label="Próximo recordatorio">
                <span className="font-medium">
                  {EVENT_LABELS[nextReminder.eventType] ?? nextReminder.eventType} · {formatDate(nextReminder.calculatedDueDate)}{" "}
                  <DaysChip dueDate={nextReminder.calculatedDueDate} />
                </span>
              </InfoField>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            {t.label}
            {t.id === "historias" && pendingNotes > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                {pendingNotes}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === "resumen" && <TabResumen pet={pet} />}
      {tab === "citas" && <TabCitas appointments={pet.appointments} />}
      {tab === "eventos" && <TabEventos events={pet.clinicalEvents} />}
      {tab === "historias" && <TabHistorias notes={pet.clinicalNotes} />}
      {tab === "recordatorios" && <TabRecordatorios reminders={pet.reminders} />}
      {tab === "attachments" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Archivos médicos</CardTitle>
          </CardHeader>
          <CardContent>
            <AttachmentsPanel
              petId={id as string}
              initialAttachments={attachments}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StatChip({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span>{icon}</span>
      <span className="font-semibold text-foreground">{value}</span>
      <span>{label}</span>
    </span>
  );
}

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      {children}
    </div>
  );
}

function EmptyState({ text, actionLabel, actionHref }: { text: string; actionLabel?: string; actionHref?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">{text}</p>
        {actionLabel && actionHref && (
          <Link href={actionHref} className="mt-3 text-primary text-sm hover:underline">{actionLabel}</Link>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Tab Resumen ──────────────────────────────────────────────────────────────

function TabResumen({ pet }: { pet: PetProfile }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span>💉</span> Últimos eventos clínicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pet.clinicalEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin eventos registrados</p>
          ) : (
            <div className="space-y-2">
              {pet.clinicalEvents.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant={eventBadgeVariant(e.type)} className="text-xs shrink-0">
                      {EVENT_LABELS[e.type] ?? e.type}
                    </Badge>
                    <span className="truncate text-foreground">{e.title}</span>
                  </div>
                  <span className="text-muted-foreground text-xs shrink-0 ml-2">{formatDate(e.appliedDate)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span>📅</span> Últimas citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pet.appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin citas registradas</p>
          ) : (
            <div className="space-y-2">
              {pet.appointments.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant={apptBadgeVariant(a.status)} className="text-xs shrink-0">
                      {APPT_STATUS_LABEL[a.status] ?? a.status}
                    </Badge>
                    <span className="truncate">{a.title}</span>
                  </div>
                  <span className="text-muted-foreground text-xs shrink-0 ml-2">{formatDate(a.date)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span>📄</span> Historias clínicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pet.clinicalNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin historias registradas</p>
          ) : (
            <div className="space-y-2">
              {pet.clinicalNotes.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant={noteBadgeVariant(n.status)} className="text-xs shrink-0">
                      {NOTE_STATUS_LABEL[n.status] ?? n.status}
                    </Badge>
                    <span className="truncate italic text-muted-foreground">
                      {n.chiefComplaint || n.rawInput}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs shrink-0 ml-2">{formatDate(n.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span>🔔</span> Recordatorios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pet.reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin recordatorios</p>
          ) : (
            <div className="space-y-2">
              {pet.reminders.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{EVENT_LABELS[r.eventType] ?? r.eventType}</span>
                  <DaysChip dueDate={r.calculatedDueDate} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab Citas ────────────────────────────────────────────────────────────────

function TabCitas({ appointments }: { appointments: Appointment[] }) {
  if (appointments.length === 0)
    return <EmptyState text="No hay citas registradas para esta mascota." />;

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Veterinario</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(a.date)}</TableCell>
              <TableCell>
                <p className="font-medium">{a.title}</p>
                {a.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.notes}</p>}
              </TableCell>
              <TableCell className="text-muted-foreground">{a.vet?.name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={apptBadgeVariant(a.status)} className="text-xs">
                  {APPT_STATUS_LABEL[a.status] ?? a.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

// ─── Tab Eventos ──────────────────────────────────────────────────────────────

function TabEventos({ events }: { events: ClinicalEvent[] }) {
  if (events.length === 0)
    return <EmptyState text="No hay eventos clínicos registrados." />;

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Aplicado</TableHead>
            <TableHead>Próximo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                <Badge variant={eventBadgeVariant(e.type)} className="text-xs">
                  {EVENT_LABELS[e.type] ?? e.type}
                </Badge>
              </TableCell>
              <TableCell>
                <p className="font-medium">{e.title}</p>
                {e.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{e.description}</p>}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(e.appliedDate)}</TableCell>
              <TableCell className="whitespace-nowrap">
                {e.nextDueDate ? <DaysChip dueDate={e.nextDueDate} /> : <span className="text-muted-foreground">—</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

// ─── Tab Historias ────────────────────────────────────────────────────────────

function TabHistorias({ notes }: { notes: ClinicalNote[] }) {
  if (notes.length === 0)
    return (
      <EmptyState
        text="No hay historias clínicas registradas."
        actionLabel="✨ Crear historia con IA"
        actionHref="/dashboard/clinical-notes"
      />
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Link href="/dashboard/clinical-notes"
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          ✨ Nueva historia con IA
        </Link>
      </div>
      {notes.map((n) => (
        <Card key={n.id}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={noteBadgeVariant(n.status)} className="text-xs">
                  {NOTE_STATUS_LABEL[n.status] ?? n.status}
                </Badge>
                {n.author && (
                  <span className="text-xs text-muted-foreground">por {n.author.name}</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{formatDate(n.createdAt)}</span>
            </div>
            {n.chiefComplaint && (
              <p className="text-sm font-medium mb-1">{n.chiefComplaint}</p>
            )}
            <p className="text-sm text-muted-foreground italic line-clamp-2">{n.rawInput}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Tab Recordatorios ────────────────────────────────────────────────────────

function TabRecordatorios({ reminders }: { reminders: Reminder[] }) {
  if (reminders.length === 0)
    return <EmptyState text="No hay recordatorios programados." />;

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Fecha prevista</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Tiempo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reminders.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{EVENT_LABELS[r.eventType] ?? r.eventType}</TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(r.calculatedDueDate)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">{r.status}</Badge>
              </TableCell>
              <TableCell><DaysChip dueDate={r.calculatedDueDate} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
