import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import {
  getProducts,
  getInventoryStats,
  getLowStockProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addMovement,
  getMovements,
} from "../../services/inventory";

const mock = new MockAdapter(api);
const product = {
  id: "prod1",
  tenantId: "t1",
  name: "Amoxicilina",
  description: null,
  category: "MEDICINE" as const,
  unit: "comprimido",
  costPrice: 5,
  salePrice: 10,
  stock: 100,
  minStock: 10,
  maxStock: null,
  sku: null,
  active: true,
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
};

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

describe("getProducts", () => {
  it("GETs /inventory/products without filters", async () => {
    mock.onGet("/inventory/products").reply(200, [product]);
    expect(await getProducts()).toEqual([product]);
  });

  it("appends category filter", async () => {
    mock.onGet(/\/inventory\/products/).reply(200, [product]);
    await getProducts({ category: "MEDICINE" });
    expect(mock.history.get[0].url).toContain("category=MEDICINE");
  });

  it("appends lowStock filter", async () => {
    mock.onGet(/\/inventory\/products/).reply(200, [product]);
    await getProducts({ lowStock: true });
    expect(mock.history.get[0].url).toContain("lowStock=true");
  });

  it("appends active filter", async () => {
    mock.onGet(/\/inventory\/products/).reply(200, [product]);
    await getProducts({ active: false });
    expect(mock.history.get[0].url).toContain("active=false");
  });
});

describe("getInventoryStats", () => {
  it("GETs /inventory/products/stats", async () => {
    const stats = { totalProducts: 10, lowStockProducts: 2, totalValue: 500, activeCategories: 3 };
    mock.onGet("/inventory/products/stats").reply(200, stats);
    expect(await getInventoryStats()).toEqual(stats);
  });
});

describe("getLowStockProducts", () => {
  it("GETs /inventory/products/low-stock", async () => {
    mock.onGet("/inventory/products/low-stock").reply(200, [product]);
    expect(await getLowStockProducts()).toEqual([product]);
  });
});

describe("getProductById", () => {
  it("GETs /inventory/products/:id", async () => {
    mock.onGet("/inventory/products/prod1").reply(200, product);
    expect(await getProductById("prod1")).toEqual(product);
  });
});

describe("createProduct", () => {
  it("POSTs to /inventory/products", async () => {
    mock.onPost("/inventory/products").reply(201, product);
    const result = await createProduct({ name: "Amoxicilina", category: "MEDICINE", costPrice: 5, salePrice: 10 });
    expect(result).toEqual(product);
  });
});

describe("updateProduct", () => {
  it("PUTs to /inventory/products/:id", async () => {
    mock.onPut("/inventory/products/prod1").reply(200, { ...product, name: "Updated" });
    const result = await updateProduct("prod1", { name: "Updated" });
    expect(result.name).toBe("Updated");
  });
});

describe("deleteProduct", () => {
  it("DELETEs /inventory/products/:id", async () => {
    mock.onDelete("/inventory/products/prod1").reply(204);
    await expect(deleteProduct("prod1")).resolves.toBeUndefined();
  });
});

describe("addMovement", () => {
  it("POSTs to /inventory/movements", async () => {
    const movement = { id: "m1", tenantId: "t1", productId: "prod1", type: "IN" as const, quantity: 10, reason: null, stockBefore: 100, stockAfter: 110, createdAt: "" };
    mock.onPost("/inventory/movements").reply(201, { movement, stockAfter: 110 });
    const result = await addMovement({ productId: "prod1", type: "IN", quantity: 10 });
    expect(result.stockAfter).toBe(110);
  });
});

describe("getMovements", () => {
  it("GETs /inventory/movements without productId", async () => {
    mock.onGet("/inventory/movements").reply(200, []);
    expect(await getMovements()).toEqual([]);
    expect(mock.history.get[0].url).toBe("/inventory/movements");
  });

  it("GETs /inventory/movements?productId=prod1 when productId provided", async () => {
    mock.onGet("/inventory/movements?productId=prod1").reply(200, []);
    await getMovements("prod1");
    expect(mock.history.get[0].url).toBe("/inventory/movements?productId=prod1");
  });
});
