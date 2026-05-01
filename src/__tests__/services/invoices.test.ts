import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import {
  getInvoices,
  getInvoiceStats,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../../services/invoices";

const mock = new MockAdapter(api);
const invoice = {
  id: "inv1",
  tenantId: "t1",
  clientId: "c1",
  petId: null,
  number: "INV-001",
  status: "DRAFT" as const,
  subtotal: 100,
  tax: 19,
  total: 119,
  notes: null,
  issuedAt: "2026-05-01T00:00:00Z",
  dueAt: null,
  paidAt: null,
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
  client: { id: "c1", name: "Juan", email: "j@j.com", phone: "123" },
  pet: null,
  items: [],
};

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

describe("getInvoices", () => {
  it("GETs /invoices? without filters", async () => {
    mock.onGet(/\/invoices/).reply(200, [invoice]);
    const result = await getInvoices();
    expect(result).toEqual([invoice]);
  });

  it("appends status filter to query string", async () => {
    mock.onGet(/\/invoices/).reply(200, [invoice]);
    await getInvoices({ status: "PAID" });
    expect(mock.history.get[0].url).toContain("status=PAID");
  });

  it("appends clientId filter to query string", async () => {
    mock.onGet(/\/invoices/).reply(200, [invoice]);
    await getInvoices({ clientId: "c1" });
    expect(mock.history.get[0].url).toContain("clientId=c1");
  });
});

describe("getInvoiceStats", () => {
  it("GETs /invoices/stats", async () => {
    const stats = { total: 5, draft: 1, issued: 2, paid: 1, cancelled: 1, totalRevenue: 500 };
    mock.onGet("/invoices/stats").reply(200, stats);
    expect(await getInvoiceStats()).toEqual(stats);
  });
});

describe("getInvoiceById", () => {
  it("GETs /invoices/:id", async () => {
    mock.onGet("/invoices/inv1").reply(200, invoice);
    expect(await getInvoiceById("inv1")).toEqual(invoice);
  });
});

describe("createInvoice", () => {
  it("POSTs to /invoices", async () => {
    mock.onPost("/invoices").reply(201, invoice);
    const result = await createInvoice({
      clientId: "c1",
      items: [{ description: "Consulta", quantity: 1, unitPrice: 100 }],
    });
    expect(result).toEqual(invoice);
  });
});

describe("updateInvoice", () => {
  it("PUTs to /invoices/:id", async () => {
    mock.onPut("/invoices/inv1").reply(200, { ...invoice, status: "PAID" });
    const result = await updateInvoice("inv1", { status: "PAID" });
    expect(result.status).toBe("PAID");
  });
});

describe("deleteInvoice", () => {
  it("DELETEs /invoices/:id", async () => {
    mock.onDelete("/invoices/inv1").reply(204);
    await expect(deleteInvoice("inv1")).resolves.toBeUndefined();
  });
});
