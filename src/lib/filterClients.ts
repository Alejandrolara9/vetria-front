export interface Pet {
  name: string;
  species: string;
  breed: string | null;
}

export type PortalStatus = "NOT_INVITED" | "INVITED" | "ACTIVE";

export interface ClientWithPets {
  name: string;
  phone: string;
  email: string;
  pets: Pet[];
  portalStatus: PortalStatus;
}

export function filterClients<T extends ClientWithPets>(clients: T[], search: string): T[] {
  if (!search.trim()) return clients;
  const q = search.toLowerCase();
  return clients.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.pets.some(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.species.toLowerCase().includes(q) ||
          (p.breed ?? "").toLowerCase().includes(q)
      )
  );
}
