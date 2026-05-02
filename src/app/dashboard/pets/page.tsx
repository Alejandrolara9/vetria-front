"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import Link from "next/link";

const BREEDS: Record<string, string[]> = {
  Canino: [
    "Mestizo","Labrador Retriever","Golden Retriever","Pastor Alemán","Bulldog Francés",
    "Bulldog Inglés","Beagle","Poodle Toy","Poodle Miniatura","Poodle Estándar",
    "Chihuahua","Yorkshire Terrier","Shih Tzu","Maltés","Schnauzer Miniatura",
    "Schnauzer Estándar","Boxer","Rottweiler","Doberman","Gran Danés",
    "Dálmata","Cocker Spaniel","Springer Spaniel","Border Collie","Collie",
    "Shetland Sheepdog","Husky Siberiano","Malamute de Alaska","Samoyedo","Chow Chow",
    "Akita","Shiba Inu","Pomerania","Spitz Alemán","Dachshund",
    "Basset Hound","Bloodhound","Greyhound","Whippet","Galgo Español",
    "Weimaraner","Vizsla","Setter Irlandés","Pointer","Braco Alemán",
    "Bichón Frisé","Bichón Maltés","Havanese","Lhasa Apso","Pekinés",
    "Pug","Carlino","Boston Terrier","Bulldog Americano","Pitbull",
    "Staffordshire Bull Terrier","American Staffordshire","Bull Terrier","Fox Terrier","Jack Russell",
    "West Highland White Terrier","Scottish Terrier","Cairn Terrier","Airedale Terrier","Bedlington Terrier",
    "Cavalier King Charles","King Charles Spaniel","Papillón","Affenpinscher","Pinscher Miniatura",
    "Doberman Pinscher","Mastín Napolitano","Mastín Español","Mastín del Pirineo","Mastín Tibetano",
    "Shar Pei","Basenji","Rhodesian Ridgeback","Boerboel","Cane Corso",
    "Dogo Argentino","Dogo de Burdeos","San Bernardo","Terranova","Leonberger",
    "Montaña de los Pirineos","Pastor Belga Malinois","Pastor Belga Groenendael","Pastor Suizo","Australian Shepherd",
    "Australian Cattle Dog","Kelpie Australiano","Pastor de Beauce","Bouvier de Flandes","Caniche",
    "Teckel","Otro",
  ],
  Felino: [
    "Mestizo","Doméstico de pelo corto","Doméstico de pelo largo","Persa","Angora Turco",
    "Maine Coon","Ragdoll","Siamés","Birmano","Burmés",
    "Bengalí","Abisinio","Somalí","Ruso Azul","Británico de pelo corto",
    "Británico de pelo largo","Escocés de orejas plegadas (Scottish Fold)","Escocés recto (Scottish Straight)","Exótico de pelo corto","Himalayo",
    "Sphynx","Devon Rex","Cornish Rex","Selkirk Rex","American Curl",
    "Balinés","Javanese","Tonkinés","Singapura","Ocicato",
    "Egyptian Mau","Chartreux","Manx","Bobtail Japonés","Bobtail Americano",
    "Norwegian Forest Cat","Siberiano","Turco Van","Korat","Havana Brown",
    "LaPerm","Pixie-bob","Ragamuffin","Savannah","Chausie","Otro",
  ],
};

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  client: { id: string; name: string };
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", species: "", breed: "", clientId: "", birthDate: "" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [petsRes, clientsRes] = await Promise.all([
        api.get("/pets"),
        api.get("/clients"),
      ]);
      setPets(petsRes.data);
      setClients(clientsRes.data);
    } catch {
      setPets([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        species: form.species,
        breed: form.breed || undefined,
        clientId: form.clientId,
        birthDate: form.birthDate || undefined,
      };
      if (editingId) {
        await api.put(`/pets/${editingId}`, payload);
      } else {
        await api.post("/pets", payload);
      }
      setForm({ name: "", species: "", breed: "", clientId: "", birthDate: "" });
      setShowForm(false);
      setEditingId(null);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al guardar");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar esta mascota?")) return;
    try {
      await api.delete(`/pets/${id}`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al eliminar");
    }
  }

  const filtered = pets.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.species.toLowerCase().includes(search.toLowerCase()) ||
      p.client.name.toLowerCase().includes(search.toLowerCase())
  );

  function getAge(birthDate: string | null): string {
    if (!birthDate) return "N/D";
    const years = Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (years < 1) {
      const months = Math.floor((Date.now() - new Date(birthDate).getTime()) / (30.44 * 24 * 60 * 60 * 1000));
      return `${months} meses`;
    }
    return `${years} anos`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mascotas</h1>
          <p className="text-muted-foreground text-sm mt-1">{pets.length} mascotas registradas</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/pets/archived"
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Archivadas
          </Link>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", species: "", breed: "", clientId: "", birthDate: "" }); }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
          >
            + Nueva mascota
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-card-bg rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Editar mascota" : "Nueva mascota"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text" placeholder="Nombre de la mascota" required
              className="px-4 py-2 border border-border rounded-lg text-sm"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              required className="px-4 py-2 border border-border rounded-lg text-sm"
              value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value, breed: "" })}
            >
              <option value="">Seleccionar especie</option>
              <option value="Canino">Canino</option>
              <option value="Felino">Felino</option>
              <option value="Ave">Ave</option>
              <option value="Reptil">Reptil</option>
              <option value="Roedor">Roedor</option>
              <option value="Otro">Otro</option>
            </select>
            {BREEDS[form.species] ? (
              <select
                className="px-4 py-2 border border-border rounded-lg text-sm"
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
              >
                <option value="">Seleccionar raza</option>
                {BREEDS[form.species].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            ) : (
              <input
                type="text" placeholder="Raza (opcional)"
                className="px-4 py-2 border border-border rounded-lg text-sm"
                value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })}
              />
            )}
            <select
              required className="px-4 py-2 border border-border rounded-lg text-sm"
              value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              <option value="">Seleccionar tutor</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="date" placeholder="Fecha de nacimiento"
              className="px-4 py-2 border border-border rounded-lg text-sm"
              value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-sm">
                {editingId ? "Actualizar" : "Guardar"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text" placeholder="Buscar por nombre, especie o tutor..."
          className="w-full max-w-md px-4 py-2 border border-border rounded-lg text-sm"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No se encontraron mascotas</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pet) => (
            <div key={pet.id} className="bg-card-bg rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{pet.name}</h3>
                  <p className="text-sm text-muted-foreground">{pet.species} {pet.breed ? `- ${pet.breed}` : ""}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{getAge(pet.birthDate)}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Tutor: {pet.client.name}</p>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/pets/${pet.id}`}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
                >
                  Ver expediente
                </Link>
                <button
                  onClick={() => { setEditingId(pet.id); setForm({ name: pet.name, species: pet.species, breed: pet.breed ?? "", birthDate: pet.birthDate ? pet.birthDate.split("T")[0] : "", clientId: pet.client.id }); setShowForm(true); }}
                  className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-gray-50">
                  Editar
                </button>
                <button onClick={() => handleDelete(pet.id)} className="text-xs px-3 py-1.5 text-danger hover:bg-red-50 rounded-lg">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
