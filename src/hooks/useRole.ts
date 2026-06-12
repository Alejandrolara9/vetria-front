"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

export type UserRole = "ADMIN" | "VET" | "RECEPTIONIST";

interface UseRoleResult {
  role: UserRole | null;
  loading: boolean;
}

/**
 * Fetches the current user's role from /users/me once on mount.
 * Returns { role, loading } where role is null while loading or on error.
 */
export function useRole(): UseRoleResult {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ role: string }>("/users/me")
      .then(({ data }) => {
        const raw = data.role as UserRole;
        if (raw === "ADMIN" || raw === "VET" || raw === "RECEPTIONIST") {
          setRole(raw);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { role, loading };
}
