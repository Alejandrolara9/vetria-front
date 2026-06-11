import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import { fetchMyCredits, requestCreditTopUp, CREDIT_PACKS } from "../../services/credits";

const mock = new MockAdapter(api);

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

const mockCredits = {
  creditBalance: 75,
  plan: "BASIC" as const,
  trialEndsAt: null,
  creditsRefreshedAt: "2026-05-01T00:00:00Z",
  wasFounder: false,
};

describe("CREDIT_PACKS", () => {
  it("exporta dos packs con sus precios en COP", () => {
    expect(CREDIT_PACKS).toHaveLength(2);
    expect(CREDIT_PACKS[0]).toEqual({ credits: 50, priceCOP: 20_000 });
    expect(CREDIT_PACKS[1]).toEqual({ credits: 150, priceCOP: 50_000 });
  });
});

describe("fetchMyCredits", () => {
  it("GETs /users/tenants/me/credits y retorna los datos del tenant", async () => {
    mock.onGet("/users/tenants/me/credits").reply(200, mockCredits);
    const result = await fetchMyCredits();
    expect(result).toEqual(mockCredits);
  });

  it("retorna creditBalance correcto", async () => {
    mock.onGet("/users/tenants/me/credits").reply(200, { ...mockCredits, creditBalance: 0 });
    const result = await fetchMyCredits();
    expect(result.creditBalance).toBe(0);
  });

  it("retorna trialEndsAt cuando está en trial", async () => {
    const trialDate = "2026-07-01T00:00:00Z";
    mock.onGet("/users/tenants/me/credits").reply(200, { ...mockCredits, trialEndsAt: trialDate });
    const result = await fetchMyCredits();
    expect(result.trialEndsAt).toBe(trialDate);
  });

  it("retorna plan PRO correctamente", async () => {
    mock.onGet("/users/tenants/me/credits").reply(200, { ...mockCredits, plan: "PRO" });
    const result = await fetchMyCredits();
    expect(result.plan).toBe("PRO");
  });

  it("lanza error si la API falla", async () => {
    mock.onGet("/users/tenants/me/credits").reply(500);
    await expect(fetchMyCredits()).rejects.toThrow();
  });
});

describe("requestCreditTopUp", () => {
  const mockTopUp = { id: "topup-001", credits: 50, paidAmountCOP: 20_000 };

  it("POSTea a /users/tenants/me/credit-request con el packIndex", async () => {
    mock.onPost("/users/tenants/me/credit-request").reply(201, mockTopUp);
    const result = await requestCreditTopUp(0);
    expect(result).toEqual(mockTopUp);
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ packIndex: 0 });
  });

  it("envía packIndex 1 para el pack de 150 créditos", async () => {
    const bigPack = { id: "topup-002", credits: 150, paidAmountCOP: 50_000 };
    mock.onPost("/users/tenants/me/credit-request").reply(201, bigPack);
    const result = await requestCreditTopUp(1);
    expect(result.credits).toBe(150);
    expect(result.paidAmountCOP).toBe(50_000);
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ packIndex: 1 });
  });

  it("retorna el id de la solicitud creada", async () => {
    mock.onPost("/users/tenants/me/credit-request").reply(201, mockTopUp);
    const result = await requestCreditTopUp(0);
    expect(result.id).toBe("topup-001");
  });

  it("lanza error si la API falla", async () => {
    mock.onPost("/users/tenants/me/credit-request").reply(400);
    await expect(requestCreditTopUp(0)).rejects.toThrow();
  });
});
