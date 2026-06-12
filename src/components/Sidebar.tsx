"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { fetchMyCredits, type TenantCredits } from "@/services/credits";
import { initiateCreditsCheckout, CREDIT_PACKS, type CreditPackIndex } from "@/services/payments";
import { getBranding } from "@/services/branding";
import { api } from "@/services/api";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Role = "ADMIN" | "VET" | "RECEPTIONIST" | "AUXILIAR";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: Role[];
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

// ─── Iconos SVG ───────────────────────────────────────────────────────────────

const Icon = ({ d, d2 }: { d: string; d2?: string }) => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
    {d2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d2} />}
  </svg>
);

// ─── Menú agrupado ────────────────────────────────────────────────────────────

const ALL_MENU_GROUPS: MenuGroup[] = [
  {
    label: "Principal",
    items: [
      {
        href: "/dashboard",
        label: "Inicio",
        icon: <Icon d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />,
      },
      {
        href: "/dashboard/appointments",
        label: "Agenda",
        icon: <Icon d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />,
      },
    ],
  },
  {
    label: "Pacientes",
    items: [
      {
        href: "/dashboard/clients",
        label: "Clientes y Mascotas",
        icon: <Icon d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
      },
    ],
  },
  {
    label: "Clínica",
    items: [
      {
        href: "/dashboard/clinical-notes",
        label: "Historias Clínicas",
        roles: ["ADMIN", "VET", "AUXILIAR"],
        icon: (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/prescriptions",
        label: "Fórmulas Médicas",
        roles: ["VET", "ADMIN"],
        icon: (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/reminders",
        label: "Recordatorios",
        roles: ["ADMIN", "VET", "RECEPTIONIST", "AUXILIAR"],
        icon: <Icon d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />,
      },
      {
        href: "/dashboard/protocols",
        label: "Protocolos",
        roles: ["ADMIN", "VET"],
        icon: <Icon d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />,
      },
    ],
  },
  {
    label: "Administración",
    items: [
      {
        href: "/dashboard/invoices",
        label: "Facturación",
        roles: ["ADMIN", "RECEPTIONIST"],
        icon: <Icon d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
      },
      {
        href: "/dashboard/services",
        label: "Catálogo",
        roles: ["ADMIN"],
        icon: <Icon d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z" />,
      },
      {
        href: "/dashboard/inventory",
        label: "Inventario",
        roles: ["ADMIN", "VET", "AUXILIAR"],
        icon: <Icon d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />,
      },
      {
        href: "/dashboard/reports",
        label: "Informes",
        roles: ["ADMIN"],
        icon: <Icon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
      },
      {
        href: "/dashboard/team",
        label: "Equipo",
        roles: ["ADMIN"],
        icon: <Icon d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />,
      },
    ],
  },
  {
    label: "Configuración",
    items: [
      {
        href: "/dashboard/billing",
        label: "Planes y pago",
        roles: ["ADMIN"],
        icon: (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/settings/branding",
        label: "Marca de la clínica",
        roles: ["ADMIN"],
        icon: (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
        ),
      },
      {
        href: "/dashboard/settings/profile",
        label: "Mi perfil",
        roles: ["VET", "ADMIN"],
        icon: (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        ),
      },
    ],
  },
];

// ─── Credit request modal ─────────────────────────────────────────────────────

function CreditModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<CreditPackIndex | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (selected === null) return;
    setSubmitting(true);
    setError("");
    try {
      const { checkoutUrl } = await initiateCreditsCheckout(selected);
      globalThis.window.location.assign(checkoutUrl);
    } catch {
      setError("No se pudo iniciar el pago. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Recargar créditos IA</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Selecciona el paquete. Serás redirigido a MercadoPago para pagar de forma segura.
        </p>
        <div className="space-y-2 mb-4">
          {CREDIT_PACKS.map((pack, idx) => (
            <button
              key={pack.credits}
              onClick={() => setSelected(idx as CreditPackIndex)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors text-sm ${
                selected === idx
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="font-medium text-gray-900">{pack.credits} créditos IA</span>
              <span className="text-gray-600">${pack.priceCOP.toLocaleString("es-CO")} COP</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Los créditos se añaden automáticamente al confirmar el pago.
        </p>
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCheckout}
            disabled={selected === null || submitting}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Redirigiendo..." : "Pagar con MercadoPago"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Credit widget ────────────────────────────────────────────────────────────

function CreditWidget() {
  const [credits, setCredits] = useState<TenantCredits | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const data = await fetchMyCredits();
      setCredits(data);
    } catch {
      // silently fail — not critical for navigation
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const trialEndsAt = credits?.trialEndsAt ?? null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - now) / (1000 * 60 * 60 * 24)))
    : 0;

  if (!credits) return null;

  const balance = credits.creditBalance;
  const isInTrial = trialEndsAt && new Date(trialEndsAt).getTime() > now;

  const balanceColor =
    balance >= 50
      ? "text-green-400"
      : balance >= 10
      ? "text-amber-400"
      : "text-red-400";

  const barPercent = Math.min(100, Math.round((balance / 100) * 100));
  const barColor =
    balance >= 50 ? "bg-green-500" : balance >= 10 ? "bg-amber-500" : "bg-red-500";

  return (
    <>
      <div className="mx-2 mb-2 bg-white/5 rounded-lg px-3 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Créditos IA
          </span>
          <span className={`text-sm font-bold ${balanceColor}`}>{balance}</span>
        </div>
        <div className="h-1 rounded-full bg-white/10 mb-2">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30">
            Plan {credits.plan}
            {isInTrial && (
              <span className="ml-1 text-amber-400">· Trial {trialDaysLeft}d</span>
            )}
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="text-[10px] text-teal-400 hover:text-teal-300 font-medium transition-colors"
          >
            + Recargar
          </button>
        </div>
        {balance < 10 && (
          <p className="text-[10px] text-red-400 mt-1.5">
            Créditos bajos — la IA puede no estar disponible.
          </p>
        )}
      </div>

      {showModal && (
        <CreditModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  role: Role | null;
}

export default function Sidebar({
  isOpen = true,
  onClose,
  role,
}: SidebarProps) {
  const pathname = usePathname();
  const [clinicName, setClinicName] = useState<string>("");
  const prevPathname = useRef(pathname);

  // Close on navigation (mobile)
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      onClose?.();
    }
  }, [pathname, onClose]);

  useEffect(() => {
    getBranding()
      .then((b) => { if (b.name) setClinicName(b.name); })
      .catch(() => {});
  }, []);

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrador",
    VET: "Veterinario",
    RECEPTIONIST: "Recepcionista",
    AUXILIAR: "Auxiliar",
  };

  const handleLogout = async () => {
    await api.post("/auth/logout").catch(() => {});
    globalThis.window.location.href = "/login";
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen w-60 bg-sidebar-bg text-sidebar-text flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Vetria" width={32} height={32} className="rounded-lg flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white leading-none">Vetria</h1>
              <p className="text-[10px] text-white/40 mt-0.5 truncate">
                {clinicName || "Sistema Veterinario IA"}
              </p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden text-white/40 hover:text-white p-1 flex-shrink-0"
            aria-label="Cerrar menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {ALL_MENU_GROUPS.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.roles || !role || item.roles.includes(role)
          );
          if (visibleItems.length === 0) return null;
          return (
          <div key={group.label} className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-1">
              {group.label}
            </p>
            {visibleItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                    isActive
                      ? "bg-teal-600 text-white font-medium"
                      : "text-white/60 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        );
        })}
      </nav>

      {/* Credit widget */}
      <CreditWidget />

      {/* Footer — usuario */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors mb-1">
          <div className="w-7 h-7 rounded-full bg-teal-500/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/80 font-medium truncate">{clinicName || "Mi clínica"}</p>
            <p className="text-[10px] text-white/40">{roleLabel[role ?? ""] ?? role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 text-xs text-white/40 hover:text-white/80 transition-colors w-full rounded-lg hover:bg-white/5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
