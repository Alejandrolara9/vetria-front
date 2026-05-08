import { BREEDS } from "../../lib/breeds";

describe("BREEDS", () => {
  it("exporta razas para Canino y Felino", () => {
    expect(BREEDS).toHaveProperty("Canino");
    expect(BREEDS).toHaveProperty("Felino");
  });

  it("Canino tiene más de 50 razas incluyendo Mestizo y Otro", () => {
    expect(BREEDS.Canino.length).toBeGreaterThan(50);
    expect(BREEDS.Canino).toContain("Mestizo");
    expect(BREEDS.Canino).toContain("Otro");
  });

  it("Felino tiene más de 30 razas incluyendo Mestizo y Otro", () => {
    expect(BREEDS.Felino.length).toBeGreaterThan(30);
    expect(BREEDS.Felino).toContain("Mestizo");
    expect(BREEDS.Felino).toContain("Otro");
  });

  it("Ave y Reptil no tienen lista de razas predefinida", () => {
    expect(BREEDS["Ave"]).toBeUndefined();
    expect(BREEDS["Reptil"]).toBeUndefined();
  });

  it("todas las entradas son arrays de strings no vacíos", () => {
    for (const breeds of Object.values(BREEDS)) {
      expect(Array.isArray(breeds)).toBe(true);
      expect(breeds.length).toBeGreaterThan(0);
      breeds.forEach((b) => expect(typeof b).toBe("string"));
    }
  });
});
