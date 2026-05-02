"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function isSuperAdminToken(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role === "SUPERADMIN";
  } catch {
    return false;
  }
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === "/superadmin/login") {
      setReady(true);
      return;
    }

    const token = localStorage.getItem("superadmin_token");
    if (!token || !isSuperAdminToken(token)) {
      router.push("/superadmin/login");
      return;
    }

    setReady(true);
  }, [router, pathname]);

  function handleLogout() {
    localStorage.removeItem("superadmin_token");
    router.push("/superadmin/login");
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (pathname === "/superadmin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg text-primary">OKVet SuperAdmin</span>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cerrar sesión
        </button>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
