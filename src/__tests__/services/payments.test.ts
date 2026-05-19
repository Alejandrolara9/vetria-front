import { api } from "@/services/api";
import {
  initiateCheckout,
  initiateCreditsCheckout,
  getTransactionStatus,
  initiateSubscription,
  cancelSubscription,
  PLAN_PRICES,
  PLAN_LABELS,
  CREDIT_PACKS,
} from "@/services/payments";

jest.mock("@/services/api", () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("payments service", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Constants ────────────────────────────────────────────────────────────

  describe("PLAN_PRICES", () => {
    it("has correct price for BASIC", () => {
      expect(PLAN_PRICES.BASIC).toBe(100_000);
    });

    it("has correct price for PRO", () => {
      expect(PLAN_PRICES.PRO).toBe(250_000);
    });
  });

  describe("PLAN_LABELS", () => {
    it("has correct label for BASIC", () => {
      expect(PLAN_LABELS.BASIC).toBe("Plan Basic");
    });

    it("has correct label for PRO", () => {
      expect(PLAN_LABELS.PRO).toBe("Plan Pro");
    });
  });

  describe("CREDIT_PACKS", () => {
    it("has exactly 2 packs", () => {
      expect(CREDIT_PACKS).toHaveLength(2);
    });

    it("pack 0 has correct credits, price and label", () => {
      expect(CREDIT_PACKS[0].credits).toBe(50);
      expect(CREDIT_PACKS[0].priceCOP).toBe(20_000);
      expect(CREDIT_PACKS[0].label).toBe("50 créditos");
    });

    it("pack 1 has correct credits, price and label", () => {
      expect(CREDIT_PACKS[1].credits).toBe(150);
      expect(CREDIT_PACKS[1].priceCOP).toBe(50_000);
      expect(CREDIT_PACKS[1].label).toBe("150 créditos");
    });

    it("all packs have positive priceCOP and credits", () => {
      for (const pack of CREDIT_PACKS) {
        expect(pack.priceCOP).toBeGreaterThan(0);
        expect(pack.credits).toBeGreaterThan(0);
      }
    });
  });

  // ── API functions use shared api client (no local axios instance) ─────────

  it("initiateCheckout calls shared api client", async () => {
    mockedApi.post.mockResolvedValue({ data: { checkoutUrl: "https://mp.com", reference: "ref-1" } });
    const result = await initiateCheckout("BASIC");
    expect(mockedApi.post).toHaveBeenCalledWith("/mp/checkout", { plan: "BASIC" });
    expect(result.checkoutUrl).toBe("https://mp.com");
  });

  it("initiateCreditsCheckout uses shared api client", async () => {
    mockedApi.post.mockResolvedValue({ data: { checkoutUrl: "https://mp.com", reference: "ref-2" } });
    const result = await initiateCreditsCheckout(0);
    expect(mockedApi.post).toHaveBeenCalledWith("/mp/checkout/credits", { packIndex: 0 });
    expect(result.reference).toBe("ref-2");
  });

  it("getTransactionStatus uses shared api client", async () => {
    mockedApi.get.mockResolvedValue({ data: { status: "approved", plan: "BASIC", credits: null, confirmedAt: null } });
    const result = await getTransactionStatus("ref-3");
    expect(mockedApi.get).toHaveBeenCalledWith("/mp/transaction/ref-3");
    expect(result.status).toBe("approved");
  });

  it("initiateSubscription uses shared api client", async () => {
    mockedApi.post.mockResolvedValue({ data: { checkoutUrl: "https://mp.com", subscriptionId: "sub-1" } });
    const result = await initiateSubscription("MONTHLY");
    expect(mockedApi.post).toHaveBeenCalledWith("/mp/checkout/subscription", { plan: "BASIC", period: "MONTHLY" });
    expect(result.subscriptionId).toBe("sub-1");
  });

  it("cancelSubscription uses shared api client", async () => {
    mockedApi.delete.mockResolvedValue({ data: {} });
    await cancelSubscription();
    expect(mockedApi.delete).toHaveBeenCalledWith("/mp/subscription");
  });
});
