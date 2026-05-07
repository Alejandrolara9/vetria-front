"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOwnerPets, clearOwnerToken, getOwnerToken, type OwnerPet } from "@/services/owner-portal";

export default function PortalPetsPage() {
  const router = useRouter();
  const [pets, setPets] = useState<OwnerPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getOwnerToken()) { router.push("/portal/login"); return; }
    getOwnerPets()
      .then(setPets)
      .catch((err: { response?: { status?: number } }) => {
        if (err.response?.status === 401) {
          clearOwnerToken();
          router.push("/portal/login");
        } else {
          setError("No se pudieron cargar tus mascotas");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    clearOwnerToken();
    router.push("/portal/login");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">🐾</span>
          </div>
          <span className="font-bold text-white">Portal Vetria</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-white mb-6">Mis mascotas</h1>

        {loading && <p className="text-slate-400">Cargando...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && pets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">No tienes mascotas vinculadas aún.</p>
            <p className="text-slate-500 text-xs mt-1">
              Solicita a tu veterinaria que te envíe una invitación.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {pets.map((pet) => (
            <Link
              key={pet.id}
              href={`/portal/pets/${pet.id}`}
              className="block bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{pet.name}</p>
                  <p className="text-slate-400 text-sm">
                    {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{pet.tenant.name}</p>
                </div>
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
