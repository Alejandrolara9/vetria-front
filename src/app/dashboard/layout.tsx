"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type Role = "ADMIN" | "VET" | "RECEPTIONIST";

const ROUTE_ROLES: Record<string, Role[]> = {
  "/dashboard/clinical-notes": ["ADMIN", "VET"],
  "/dashboard/prescriptions": ["VET", "ADMIN"],
  "/dashboard/reminders": ["ADMIN", "VET"],
  "/dashboard/protocols": ["ADMIN", "VET"],
  "/dashboard/invoices": ["ADMIN", "RECEPTIONIST"],
  "/dashboard/services": ["ADMIN"],
  "/dashboard/inventory": ["ADMIN"],
  "/dashboard/reports": ["ADMIN"],
  "/dashboard/team": ["ADMIN"],
  "/dashboard/settings/branding": ["ADMIN"],
  "/dashboard/settings/profile": ["VET", "ADMIN"],
};

function decodeRole(token: string): Role | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const role = payload.role as string;
    if (role === "ADMIN" || role === "VET" || role === "RECEPTIONIST") return role;
  } catch { /* ignore */ }
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const role = decodeRole(token);
    if (!role) {
      router.push("/login");
      return;
    }

    const requiredRoles = Object.entries(ROUTE_ROLES).find(([path]) =>
      pathname === path || pathname.startsWith(path + "/")
    )?.[1];

    if (requiredRoles && !requiredRoles.includes(role)) {
      router.replace("/dashboard");
      return;
    }

    setReady(true);
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Mobile top bar */}
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
    </div>
  );
}
