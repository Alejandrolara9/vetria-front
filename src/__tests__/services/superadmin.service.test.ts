import MockAdapter from "axios-mock-adapter";
import {
  superAdminApi,
  superAdminLogin,
  fetchTenants,
  updateTenant,
  fetchTenantUsers,
  fetchStats,
  changeSuperAdminPassword,
  fetchCreditRequests,
  confirmCreditRequest,
  addCreditsAdmin,
} from "../../services/superadmin.service";

const mock = new MockAdapter(superAdminApi);

beforeEach(() => {
  mock.reset();
  localStorage.clear();
});
afterAll(() => mock.restore());

const tenant = {
  id: "t1",
  name: "Clinica Demo",
  slug: "clinica-demo",
  plan: "FREE" as const,
  active: true,
  createdAt: "2026-05-01T00:00:00Z",
  _count: { users: 2, pets: 10, appointments: 50 },
};

describe("superAdminLogin", () => {
  it("POSTs to /superadmin/login and returns the token", async () => {
    mock.onPost("/superadmin/login").reply(200, { token: "sa-token-abc" });
    const token = await superAdminLogin("admin@vetria.com", "secret");
    expect(token).toBe("sa-token-abc");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ email: "admin@vetria.com", password: "secret" });
  });
});

describe("fetchTenants", () => {
  it("GETs /superadmin/tenants", async () => {
    mock.onGet("/superadmin/tenants").reply(200, [tenant]);
    expect(await fetchTenants()).toEqual([tenant]);
  });
});

describe("updateTenant", () => {
  it("PATCHes /superadmin/tenants/:id", async () => {
    mock.onPatch("/superadmin/tenants/t1").reply(200, { ...tenant, active: false });
    const result = await updateTenant("t1", { active: false });
    expect(result.active).toBe(false);
  });
});

describe("fetchTenantUsers", () => {
  it("GETs /superadmin/tenants/:id/users", async () => {
    const users = [{ id: "u1", name: "Vet", email: "vet@clinic.com", role: "VET", createdAt: "" }];
    mock.onGet("/superadmin/tenants/t1/users").reply(200, users);
    expect(await fetchTenantUsers("t1")).toEqual(users);
  });
});

describe("fetchStats", () => {
  it("GETs /superadmin/stats", async () => {
    const stats = { totalTenants: 5, activeTenants: 4, totalUsers: 20, totalPets: 100, planBreakdown: { FREE: 3, BASIC: 1, PRO: 1 } };
    mock.onGet("/superadmin/stats").reply(200, stats);
    expect(await fetchStats()).toEqual(stats);
  });
});

describe("changeSuperAdminPassword", () => {
  it("PATCHes /superadmin/me/password", async () => {
    mock.onPatch("/superadmin/me/password").reply(200);
    await expect(changeSuperAdminPassword("newpass123")).resolves.toBeUndefined();
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ newPassword: "newpass123" });
  });
});

describe("fetchCreditRequests", () => {
  const creditRequest = {
    id: "req-001",
    tenantId: "t1",
    credits: 50,
    paidAmountCOP: 20_000,
    createdAt: "2026-05-01T00:00:00Z",
    tenant: { id: "t1", name: "Clinica Demo", plan: "BASIC", creditBalance: 10 },
  };

  it("GETs /superadmin/credit-requests y retorna la lista", async () => {
    mock.onGet("/superadmin/credit-requests").reply(200, [creditRequest]);
    const result = await fetchCreditRequests();
    expect(result).toEqual([creditRequest]);
  });

  it("retorna array vacío cuando no hay solicitudes pendientes", async () => {
    mock.onGet("/superadmin/credit-requests").reply(200, []);
    const result = await fetchCreditRequests();
    expect(result).toEqual([]);
  });

  it("retorna datos del tenant anidado en cada solicitud", async () => {
    mock.onGet("/superadmin/credit-requests").reply(200, [creditRequest]);
    const result = await fetchCreditRequests();
    expect(result[0].tenant.name).toBe("Clinica Demo");
    expect(result[0].tenant.creditBalance).toBe(10);
  });
});

describe("confirmCreditRequest", () => {
  it("POSTea a /superadmin/credit-requests/:reqId/confirm", async () => {
    mock.onPost("/superadmin/credit-requests/req-001/confirm").reply(200, { creditBalance: 60 });
    const result = await confirmCreditRequest("req-001");
    expect(result.creditBalance).toBe(60);
  });

  it("retorna el nuevo saldo actualizado del tenant", async () => {
    mock.onPost("/superadmin/credit-requests/req-002/confirm").reply(200, { creditBalance: 200 });
    const result = await confirmCreditRequest("req-002");
    expect(result).toEqual({ creditBalance: 200 });
  });

  it("lanza error si la solicitud no existe", async () => {
    mock.onPost("/superadmin/credit-requests/inexistente/confirm").reply(404);
    await expect(confirmCreditRequest("inexistente")).rejects.toThrow();
  });
});

describe("addCreditsAdmin", () => {
  it("POSTea a /superadmin/tenants/:id/credits con credits y reason", async () => {
    mock.onPost("/superadmin/tenants/t1/credits").reply(200, { creditBalance: 150 });
    const result = await addCreditsAdmin("t1", 50, "Ajuste manual");
    expect(result.creditBalance).toBe(150);
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ credits: 50, reason: "Ajuste manual" });
  });

  it("envía reason undefined si no se proporciona", async () => {
    mock.onPost("/superadmin/tenants/t1/credits").reply(200, { creditBalance: 100 });
    await addCreditsAdmin("t1", 100);
    const body = JSON.parse(mock.history.post[0].data);
    expect(body.credits).toBe(100);
  });

  it("lanza error si el tenant no existe", async () => {
    mock.onPost("/superadmin/tenants/inexistente/credits").reply(404);
    await expect(addCreditsAdmin("inexistente", 50)).rejects.toThrow();
  });
});

describe("superAdminApi interceptor", () => {
  it("adds Authorization header from superadmin_token", async () => {
    localStorage.setItem("superadmin_token", "sa-jwt");
    mock.onGet("/superadmin/tenants").reply(200, []);
    await superAdminApi.get("/superadmin/tenants");
    expect(mock.history.get[0].headers?.Authorization).toBe("Bearer sa-jwt");
  });

  it("does not add Authorization header when no superadmin_token", async () => {
    mock.onGet("/superadmin/tenants").reply(200, []);
    await superAdminApi.get("/superadmin/tenants");
    expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
  });

  it("limpia superadmin_token del localStorage en error 401", async () => {
    localStorage.setItem("superadmin_token", "expired-token");
    mock.onGet("/superadmin/tenants").reply(401);

    await expect(superAdminApi.get("/superadmin/tenants")).rejects.toBeDefined();
    expect(localStorage.getItem("superadmin_token")).toBeNull();
  });
});
