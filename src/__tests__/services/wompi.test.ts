import { PLAN_PRICES, PLAN_LABELS } from "../../services/wompi";

describe("wompi service constants", () => {
  it("has correct prices", () => {
    expect(PLAN_PRICES.BASIC).toBe(100_000);
    expect(PLAN_PRICES.PRO).toBe(250_000);
  });

  it("has correct labels", () => {
    expect(PLAN_LABELS.BASIC).toBe("Plan Basic");
    expect(PLAN_LABELS.PRO).toBe("Plan Pro");
  });
});
