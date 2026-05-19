// src/components/clients/PetCard.tsx
"use client";

import Link from "next/link";

const SPECIES_EMOJI: Record<string, string> = {
  Canino: "🐕",
  Felino: "🐈",
  Ave: "🐦",
  Reptil: "🦎",
  Roedor: "🐹",
};

function getAge(birthDate: string | null): string {
  if (!birthDate) return "N/D";
  const ms = Date.now() - new Date(birthDate).getTime();
  const years = Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
  if (years < 1) {
    const months = Math.floor(ms / (30.44 * 24 * 60 * 60 * 1000));
    return `${months}m`;
  }
  return `${years}a`;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string;
  birthDate: string | null;
}

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
}

export function PetCard({ pet, onEdit }: PetCardProps) {
  const emoji = SPECIES_EMOJI[pet.species] ?? "🐾";
  return (
    <div className="bg-white border border-border rounded-lg p-3 flex flex-col gap-1 min-w-[110px] max-w-[140px]">
      <div className="text-xl">{emoji}</div>
      <Link
        href={`/dashboard/pets/${pet.id}`}
        className="font-semibold text-sm hover:underline text-foreground leading-tight"
      >
        {pet.name}
      </Link>
      <p className="text-xs text-muted-foreground">
        {pet.sex} · {pet.breed ?? pet.species} · {getAge(pet.birthDate)}
      </p>
      <button
        onClick={() => onEdit(pet)}
        className="mt-1 text-xs px-2 py-1 border border-border rounded hover:bg-gray-50 text-muted-foreground"
      >
        ✏️ Editar
      </button>
    </div>
  );
}
