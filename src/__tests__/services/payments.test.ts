import { PLAN_PRICES, PLAN_LABELS, CREDIT_PACKS } from "../../services/payments";

describe("payments service constants", () => {
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
});
