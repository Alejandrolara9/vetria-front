// src/services/inventory.ts
import { api } from "./api";

// ─── Enums / literales ────────────────────────────────────────────────────────

export type ProductCategory =
  | "MEDICINE"
  | "VACCINE"
  | "FOOD"
  | "ACCESSORY"
  | "CONSUMABLE"
  | "EQUIPMENT"
  | "OTHER";

export type MovementType = "IN" | "OUT" | "ADJUSTMENT";

// ─── Tipos de dominio ─────────────────────────────────────────────────────────

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  maxStock: number | null;
  sku: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  movements?: StockMovement[];
}

export interface StockMovement {
  id: string;
  tenantId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string | null;
  stockBefore: number;
  stockAfter: number;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string | null;
    unit: string;
    category?: ProductCategory;
  };
}

export interface InventoryStats {
  totalProducts: number;
  lowStockProducts: number;
  totalValue: number;
  activeCategories: number;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateProductDto {
  name: string;
  description?: string;
  category: ProductCategory;
  unit?: string;
  costPrice: number;
  salePrice: number;
  stock?: number;
  minStock?: number;
  maxStock?: number;
  sku?: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface CreateMovementDto {
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
}

// ─── Funciones de servicio ────────────────────────────────────────────────────

export interface GetProductsFilters {
  category?: ProductCategory;
  active?: boolean;
  lowStock?: boolean;
}

export async function getProducts(
  filters?: GetProductsFilters
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.active !== undefined)
    params.append("active", String(filters.active));
  if (filters?.lowStock) params.append("lowStock", "true");

  const qs = params.toString();
  const res = await api.get<Product[]>(`/inventory/products${qs ? `?${qs}` : ""}`);
  return res.data;
}

export async function getInventoryStats(): Promise<InventoryStats> {
  const res = await api.get<InventoryStats>("/inventory/products/stats");
  return res.data;
}

export async function getLowStockProducts(): Promise<Product[]> {
  const res = await api.get<Product[]>("/inventory/products/low-stock");
  return res.data;
}

export async function getProductById(id: string): Promise<Product> {
  const res = await api.get<Product>(`/inventory/products/${id}`);
  return res.data;
}

export async function createProduct(data: CreateProductDto): Promise<Product> {
  const res = await api.post<Product>("/inventory/products", data);
  return res.data;
}

export async function updateProduct(
  id: string,
  data: UpdateProductDto
): Promise<Product> {
  const res = await api.put<Product>(`/inventory/products/${id}`, data);
  return res.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/inventory/products/${id}`);
}

export async function addMovement(
  data: CreateMovementDto
): Promise<{ movement: StockMovement; stockAfter: number }> {
  const res = await api.post<{ movement: StockMovement; stockAfter: number }>(
    "/inventory/movements",
    data
  );
  return res.data;
}

export async function getMovements(productId?: string): Promise<StockMovement[]> {
  const qs = productId ? `?productId=${productId}` : "";
  const res = await api.get<StockMovement[]>(`/inventory/movements${qs}`);
  return res.data;
}
