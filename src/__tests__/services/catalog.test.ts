import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import {
  searchCatalog,
  getServices,
  createService,
  updateService,
  deleteService,
} from "../../services/catalog";

const mock = new MockAdapter(api);
const service = {
  id: "svc1",
  name: "Consulta general",
  description: null,
  price: 50000,
  category: null,
  active: true,
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
};

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

describe("searchCatalog", () => {
  it("returns empty array without making a request when q is empty string", async () => {
    const result = await searchCatalog("");
    expect(result).toEqual([]);
    expect(mock.history.get).toHaveLength(0);
  });

  it("returns empty array without making a request when q is only whitespace", async () => {
    const result = await searchCatalog("   ");
    expect(result).toEqual([]);
    expect(mock.history.get).toHaveLength(0);
  });

  it("GETs /services/search-catalog with q param", async () => {
    const item = { type: "service" as const, id: "svc1", name: "Consulta", price: 50000 };
    mock.onGet("/services/search-catalog").reply(200, [item]);
    const result = await searchCatalog("consulta");
    expect(result).toEqual([item]);
    expect(mock.history.get[0].params).toEqual({ q: "consulta" });
  });
});

describe("getServices", () => {
  it("GETs /services without search param", async () => {
    mock.onGet("/services").reply(200, [service]);
    const result = await getServices();
    expect(result).toEqual([service]);
    expect(mock.history.get[0].params).toBeUndefined();
  });

  it("GETs /services with search param", async () => {
    mock.onGet("/services").reply(200, [service]);
    await getServices("consulta");
    expect(mock.history.get[0].params).toEqual({ search: "consulta" });
  });
});

describe("createService", () => {
  it("POSTs to /services", async () => {
    mock.onPost("/services").reply(201, service);
    const result = await createService({ name: "Consulta general", price: 50000 });
    expect(result).toEqual(service);
  });
});

describe("updateService", () => {
  it("PUTs to /services/:id", async () => {
    mock.onPut("/services/svc1").reply(200, { ...service, name: "Updated" });
    const result = await updateService("svc1", { name: "Updated" });
    expect(result.name).toBe("Updated");
  });
});

describe("deleteService", () => {
  it("DELETEs /services/:id", async () => {
    mock.onDelete("/services/svc1").reply(204);
    await expect(deleteService("svc1")).resolves.toBeUndefined();
  });
});
