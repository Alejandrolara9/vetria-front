"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { RenewalWarningModal } from "@/components/RenewalWarningModal";
import { fetchMyCredits } from "@/services/credits";
import { api, redirect } from "@/services/api";

type Role = "ADMIN" | "VET" | "RECEPTIONIST";
const VALID_ROLES: Role[] = ["ADMIN", "VET", "RECEPTIONIST"];

const ROUTE_ROLES: Record<string, Role[]> = {
  "/dashboard/clinical-notes": ["ADMIN", "VET"],
  "/dashboard/prescriptions": ["VET", "ADMIN"],
  "/dashboard/reminders": ["ADMIN", "VET", "RECEPTIONIST"],
  "/dashboard/protocols": ["ADMIN", "VET"],
  "/dashboard/invoices": ["ADMIN", "RECEPTIONIST"],
  "/dashboard/services": ["ADMIN"],
  "/dashboard/inventory": ["ADMIN", "VET"],
  "/dashboard/reports": ["ADMIN"],
  "/dashboard/team": ["ADMIN"],
  "/dashboard/settings/branding": ["ADMIN"],
  "/dashboard/settings/profile": ["VET", "ADMIN"],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gracePeriodEndsAt, setGracePeriodEndsAt] = useState<string | null>(null);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Fetch role once on mount — 401 is handled by api.ts interceptor (redirects to /login?expired=1)
  useEffect(() => {
    api.get<{ role: string }>("/users/me")
      .then(({ data }) => {
        const raw = data.role as string;
        if (VALID_ROLES.includes(raw as Role)) {
          setRole(raw as Role);
        } else {
          redirect("/login");
        }
      })
      .catch(() => {});
  }, []);

  // Fetch credits independently — runs in parallel with role effect
  useEffect(() => {
    fetchMyCredits()
      .then((c) => setGracePeriodEndsAt(c.gracePeriodEndsAt))
      .catch(() => {});
  }, []);

  // Check route permissions whenever role or pathname changes
  useEffect(() => {
    if (!role) return;

    const requiredRoles = Object.entries(ROUTE_ROLES).find(([path]) =>
      pathname === path || pathname.startsWith(path + "/")
    )?.[1];

    if (requiredRoles && !requiredRoles.includes(role)) {
      router.replace("/dashboard");
      return;
    }

    setReady(true);
  }, [role, pathname, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} role={role} />

      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar-bg flex items-center px-4 z-30 shadow-lg">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white/70 hover:text-white p-1 -ml-1"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-white font-bold ml-3 text-base">Vetria</span>
      </div>

      <main className="flex-1 md:ml-60 pt-14 md:pt-0 p-4 md:p-8 min-w-0">
        {children}
      </main>

      {gracePeriodEndsAt && (
        <RenewalWarningModal gracePeriodEndsAt={gracePeriodEndsAt} />
      )}
    </div>
  );
}
