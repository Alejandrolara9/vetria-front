import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import {
  getDashboardStats,
  getAppointmentsReport,
  getClientsReport,
  getFinancialReport,
  getInventoryReport,
  getRemindersReport,
} from "../../services/reports";

const mock = new MockAdapter(api);

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

const dashboardStats = {
  period: "month",
  appointmentsCount: 10,
  appointmentsByStatus: {},
  newClients: 3,
  newPets: 5,
  revenueTotal: 500000,
  invoicesByStatus: {},
  remindersStats: { scheduled: 4, sent: 2, confirmed: 1, expired: 0 },
  topServices: [],
};

describe("getDashboardStats", () => {
  it("GETs /reports/dashboard with default period=month", async () => {
    mock.onGet("/reports/dashboard").reply(200, dashboardStats);
    await getDashboardStats();
    expect(mock.history.get[0].params).toEqual({ period: "month" });
  });

  it("GETs /reports/dashboard with explicit period", async () => {
    mock.onGet("/reports/dashboard").reply(200, dashboardStats);
    await getDashboardStats("week");
    expect(mock.history.get[0].params).toEqual({ period: "week" });
  });
});

describe("getAppointmentsReport", () => {
  it("GETs /reports/appointments with from and to params", async () => {
    const report = { appointments: [], totals: { total: 0, byStatus: {} } };
    mock.onGet("/reports/appointments").reply(200, report);
    const result = await getAppointmentsReport("2026-05-01", "2026-05-31");
    expect(result).toEqual(report);
    expect(mock.history.get[0].params).toEqual({ from: "2026-05-01", to: "2026-05-31" });
  });
});

describe("getClientsReport", () => {
  it("GETs /reports/clients", async () => {
    const report = { totalClients: 10, totalPets: 15, avgPetsPerClient: 1.5, topSpecies: [], topClients: [], petsWithoutRecentAppointment: [] };
    mock.onGet("/reports/clients").reply(200, report);
    expect(await getClientsReport()).toEqual(report);
  });
});

describe("getFinancialReport", () => {
  it("GETs /reports/financial with from and to params", async () => {
    const report = { invoices: [], totals: { totalIssued: 0, totalPaid: 0, totalPending: 0, totalCancelled: 0, byStatus: {} }, revenueByPeriod: [] };
    mock.onGet("/reports/financial").reply(200, report);
    const result = await getFinancialReport("2026-05-01", "2026-05-31");
    expect(result).toEqual(report);
    expect(mock.history.get[0].params).toEqual({ from: "2026-05-01", to: "2026-05-31" });
  });
});

describe("getInventoryReport", () => {
  it("GETs /reports/inventory", async () => {
    const report = { totalActiveProducts: 5, lowStockCount: 1, totalStockValue: 1000, lowStockProducts: [], recentMovements: [], productsWithoutMovement: [] };
    mock.onGet("/reports/inventory").reply(200, report);
    expect(await getInventoryReport()).toEqual(report);
  });
});

describe("getRemindersReport", () => {
  it("GETs /reports/reminders with from and to params", async () => {
    const report = { byEventType: [], notifications: { total: 0, sent: 0, opened: 0, confirmed: 0, openRate: 0, confirmRate: 0 }, overallStats: { total: 0, scheduled: 0, sent: 0, confirmed: 0, expired: 0, confirmationRate: 0 } };
    mock.onGet("/reports/reminders").reply(200, report);
    const result = await getRemindersReport("2026-05-01", "2026-05-31");
    expect(result).toEqual(report);
    expect(mock.history.get[0].params).toEqual({ from: "2026-05-01", to: "2026-05-31" });
  });
});
