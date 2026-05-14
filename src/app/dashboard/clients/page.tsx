"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { inviteClientToPortal, requestExternalAccess } from "@/services/owner-portal";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState<string | null>(null);
  const [inviteMsg, setInviteMsg] = useState<Record<string, string>>({});
  const [requestingAccess, setRequestingAccess] = useState<string | null>(null);
  const [accessMsg, setAccessMsg] = useState<Record<string, string>>({});

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    try {
      const res = await api.get("/clients");
      setClients(res.data);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, form);
      } else {
        await api.post("/clients", form);
      }
      setForm({ name: "", phone: "", email: "" });
      setShowForm(false);
      setEditingId(null);
      loadClients();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Error al guardar");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar este cliente?")) return;
    try {
      await api.delete(`/clients/${id}`);
      loadClients();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Error al eliminar");
    }
  }

  function startEdit(client: Client) {
    setForm({ name: client.name, phone: client.phone, email: client.email });
    setEditingId(client.id);
    setShowForm(true);
  }

  const handleInvite = async (clientId: string) => {
    setInviting(clientId);
    try {
      const res = await inviteClientToPortal(clientId);
      setInviteMsg((prev) => ({ ...prev, [clientId]: res.message }));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Error al enviar la invitación";
      setInviteMsg((prev) => ({ ...prev, [clientId]: msg }));
    } finally {
      setInviting(null);
    }
  };

  async function handleRequestAccess(clientEmail: string, clientId: string) {
    if (!clientEmail) {
      setAccessMsg((prev) => ({ ...prev, [clientId]: "Este cliente no tiene email registrado" }));
      return;
    }
    setRequestingAccess(clientId);
    try {
      await requestExternalAccess(clientEmail);
      setAccessMsg((prev) => ({ ...prev, [clientId]: "Solicitud enviada. El tutor debe aprobarla desde su portal." }));
    } catch {
      setAccessMsg((prev) => ({ ...prev, [clientId]: "Error al enviar la solicitud" }));
    } finally {
      setRequestingAccess(null);
    }
  }

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} clientes registrados</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", phone: "", email: "" }); }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          + Nuevo cliente
        </button>
      </div>

      {showForm && (
        <div className="bg-card-bg rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Editar cliente" : "Nuevo cliente"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text" placeholder="Nombre completo" required
              className="px-4 py-2 border border-border rounded-lg text-sm"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="tel" placeholder="Telefono" required
              className="px-4 py-2 border border-border rounded-lg text-sm"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              type="email" placeholder="Email" required
              className="px-4 py-2 border border-border rounded-lg text-sm"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div className="md:col-span-3 flex gap-2">
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
          type="text" placeholder="Buscar por nombre, email o telefono..."
          className="w-full max-w-md px-4 py-2 border border-border rounded-lg text-sm"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No se encontraron clientes</div>
      ) : (
        <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Nombre</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Telefono</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Registro</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{client.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{client.phone}</td>
                  <td className="px-6 py-4 text-muted-foreground">{client.email}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => startEdit(client)} className="text-primary hover:underline mr-3">Editar</button>
                    <button onClick={() => handleDelete(client.id)} className="text-danger hover:underline mr-3">Eliminar</button>
                    <div className="inline-flex flex-col items-end gap-1">
                      <button
                        onClick={() => handleInvite(client.id)}
                        disabled={inviting === client.id}
                        className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        {inviting === client.id ? "Enviando..." : "Invitar al portal"}
                      </button>
                      {inviteMsg[client.id] && (
                        <p className="text-xs text-green-400 mt-0.5">{inviteMsg[client.id]}</p>
                      )}
                      <button
                        onClick={() => handleRequestAccess(client.email, client.id)}
                        disabled={requestingAccess === client.id}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs rounded-lg transition-all disabled:opacity-50"
                      >
                        {requestingAccess === client.id ? "Enviando..." : "Solicitar historial externo"}
                      </button>
                      {accessMsg[client.id] && (
                        <p className="text-xs text-slate-400 mt-1">{accessMsg[client.id]}</p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
