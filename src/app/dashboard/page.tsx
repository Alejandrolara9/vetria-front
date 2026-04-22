"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  clients: number;
  pets: number;
  appointmentsToday: { total: number; confirmed: number; completed: number; pending: number };
  reminders: { scheduled: number; overdue: number; confirmed: number };
}

const STAT_CARDS = (stats: Stats) => [
  { label: "Clientes", value: stats.clients, href: "/dashboard/clients", color: "bg-blue-500", trend: null },
  { label: "Mascotas", value: stats.pets, href: "/dashboard/pets", color: "bg-green-500", trend: null },
  { label: "Citas hoy", value: stats.appointmentsToday.total, href: "/dashboard/appointments", color: "bg-purple-500", trend: `${stats.appointmentsToday.confirmed} confirmadas` },
  { label: "Recordatorios pendientes", value: stats.reminders.scheduled, href: "/dashboard/reminders", color: "bg-amber-500", trend: null },
  { label: "Recordatorios vencidos", value: stats.reminders.overdue, href: "/dashboard/reminders", color: "bg-red-500", trend: stats.reminders.overdue > 0 ? "Requieren atención" : null },
  { label: "Confirmados por cliente", value: stats.reminders.confirmed, href: "/dashboard/reminders", color: "bg-emerald-500", trend: null },
];

const QUICK_ACTIONS = [
  {
    label: "Nueva cita",
    description: "Agendar una consulta",
    href: "/dashboard/appointments",
    icon: "📅",
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "Historia clínica con IA",
    description: "Generar con inteligencia artificial",
    href: "/dashboard/clinical-notes",
    icon: "✨",
    color: "bg-purple-100 text-purple-600",
  },
  {
    label: "Nuevo cliente",
    description: "Registrar tutor",
    href: "/dashboard/clients",
    icon: "👤",
    color: "bg-green-100 text-green-600",
  },
  {
    label: "Nueva mascota",
    description: "Registrar paciente",
    href: "/dashboard/pets",
    icon: "🐾",
    color: "bg-amber-100 text-amber-600",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [userRes, clientsRes, petsRes, appointmentsRes, remindersRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/clients"),
        api.get("/pets"),
        api.get("/appointments/stats/today").catch(() => ({ data: { total: 0, confirmed: 0, completed: 0, pending: 0 } })),
        api.get("/reminders/stats").catch(() => ({ data: { scheduled: 0, overdue: 0, confirmed: 0 } })),
      ]);
      setUserName(userRes.data?.name || "");
      setStats({
        clients: clientsRes.data?.length || 0,
        pets: petsRes.data?.length || 0,
        appointmentsToday: appointmentsRes.data,
        reminders: remindersRes.data,
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Resumen de tu clínica veterinaria · {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-11 h-11 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAT_CARDS(stats).map((card) => (
            <Link key={card.label} href={card.href}>
              <Card className="hover:shadow-md transition-all hover:border-gray-300 cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500 truncate">{card.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1 leading-tight">{card.value}</p>
                      {card.trend && (
                        <p className="text-xs text-gray-400 mt-1">{card.trend}</p>
                      )}
                    </div>
                    <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center flex-shrink-0 ml-4`}>
                      <span className="text-white text-lg font-bold">{card.value}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acciones rápidas */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <Link key={action.label} href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${action.color}`}>
                    {action.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800 group-hover:text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estado del sistema */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Vetria · IA integrada</h2>
            <div className="space-y-3">
              {[
                "Generación de historias clínicas con IA (Haiku)",
                "Recordatorios inteligentes de vacunación",
                "Agenda con detección de conflictos",
                "Protocolos de vacunación configurables",
                "Streaming de texto en tiempo real",
                "Seguridad multi-tenant por clínica",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  {feat}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
