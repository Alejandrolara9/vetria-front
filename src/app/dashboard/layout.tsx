"use client";

import { useEffect, useState } from "react";
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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
