// src/services/catalog.ts
import { api } from "./api";

/**
 * Representa un ítem unificado del catálogo de búsqueda.
 * Puede ser un Servicio del catálogo de la clínica o un Producto del inventario.
 * Se usa en el autocompletado al crear ítems en facturas.
 */
export interface CatalogItem {
  type: "service" | "product";
  id: string;
  name: string;
  description?: string;
  /** Para servicios: precio fijo. Para productos: salePrice del inventario. */
  price: number;
  category?: string;
  /** Solo para productos: unidades disponibles en inventario. */
  stock?: number;
  /** Solo para productos: unidad de medida (ej: "unidad", "frasco", "kg"). */
  unit?: string;
}

/**
 * Busca en paralelo en el catálogo de servicios y el inventario de productos
 * del tenant autenticado. Usado para autocompletar ítems en facturas.
 *
 * @param q - Texto de búsqueda (mínimo 1 carácter para hacer la llamada)
 * @returns Array de hasta 8 resultados (4 servicios + 4 productos)
 */
export async function searchCatalog(q: string): Promise<CatalogItem[]> {
  if (!q.trim()) return [];

  const res = await api.get<CatalogItem[]>("/services/search-catalog", {
    params: { q },
  });

  return res.data;
}

// ─── Tipos para el CRUD del catálogo de servicios ────────────────────────────

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  category?: string;
  active?: boolean;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  active?: boolean;
}

// ─── Funciones CRUD de servicios ─────────────────────────────────────────────

export async function getServices(search?: string): Promise<Service[]> {
  const res = await api.get<Service[]>("/services", {
    params: search ? { search } : undefined,
  });
  return res.data;
}

export async function createService(data: CreateServiceDto): Promise<Service> {
  const res = await api.post<Service>("/services", data);
  return res.data;
}

export async function updateService(
  id: string,
  data: UpdateServiceDto
): Promise<Service> {
  const res = await api.put<Service>(`/services/${id}`, data);
  return res.data;
}

export async function deleteService(id: string): Promise<void> {
  await api.delete(`/services/${id}`);
}
