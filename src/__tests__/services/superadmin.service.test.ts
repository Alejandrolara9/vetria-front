import MockAdapter from "axios-mock-adapter";
import { superAdminApi, superAdminLogin, fetchTenants, updateTenant, fetchTenantUsers, fetchStats, changeSuperAdminPassword } from "../../services/superadmin.service";

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
});
