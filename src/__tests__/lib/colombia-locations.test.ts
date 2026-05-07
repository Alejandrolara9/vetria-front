import {
  COLOMBIA_DEPARTMENTS,
  getCitiesByDepartment,
  type Department,
} from "../../lib/colombia-locations";

// ─── Estructura del catálogo ───────────────────────────────────────────────────

describe("COLOMBIA_DEPARTMENTS", () => {
  it("es un arreglo no vacío", () => {
    expect(Array.isArray(COLOMBIA_DEPARTMENTS)).toBe(true);
    expect(COLOMBIA_DEPARTMENTS.length).toBeGreaterThan(0);
  });

  it("contiene los 32 departamentos más Bogotá D.C. (33 entidades)", () => {
    // Colombia tiene 32 departamentos + el Distrito Capital
    expect(COLOMBIA_DEPARTMENTS.length).toBe(33);
  });

  it("cada departamento tiene name (string) y cities (string[])", () => {
    COLOMBIA_DEPARTMENTS.forEach((dept: Department) => {
      expect(typeof dept.name).toBe("string");
      expect(dept.name.length).toBeGreaterThan(0);
      expect(Array.isArray(dept.cities)).toBe(true);
      expect(dept.cities.length).toBeGreaterThan(0);
    });
  });

  it("cada ciudad es un string no vacío", () => {
    COLOMBIA_DEPARTMENTS.forEach((dept: Department) => {
      dept.cities.forEach((city) => {
        expect(typeof city).toBe("string");
        expect(city.length).toBeGreaterThan(0);
      });
    });
  });

  it("contiene departamentos clave del territorio colombiano", () => {
    const names = COLOMBIA_DEPARTMENTS.map((d) => d.name);
    expect(names).toContain("Antioquia");
    expect(names).toContain("Cundinamarca");
    expect(names).toContain("Valle del Cauca");
    expect(names).toContain("Bogotá D.C.");
    expect(names).toContain("Atlántico");
  });

  it("incluye ciudades capitales en sus departamentos correspondientes", () => {
    const antioquia = COLOMBIA_DEPARTMENTS.find((d) => d.name === "Antioquia");
    expect(antioquia?.cities).toContain("Medellín");

    const bogota = COLOMBIA_DEPARTMENTS.find((d) => d.name === "Bogotá D.C.");
    expect(bogota?.cities).toContain("Bogotá");

    const valle = COLOMBIA_DEPARTMENTS.find((d) => d.name === "Valle del Cauca");
    expect(valle?.cities).toContain("Cali");
  });

  it("no tiene nombres de departamentos duplicados", () => {
    const names = COLOMBIA_DEPARTMENTS.map((d) => d.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});

// ─── getCitiesByDepartment ─────────────────────────────────────────────────────

describe("getCitiesByDepartment", () => {
  it("retorna el arreglo de ciudades para un departamento existente", () => {
    const cities = getCitiesByDepartment("Antioquia");
    expect(Array.isArray(cities)).toBe(true);
    expect(cities.length).toBeGreaterThan(0);
    expect(cities).toContain("Medellín");
  });

  it("retorna arreglo vacío para un departamento inexistente", () => {
    const cities = getCitiesByDepartment("Departamento Ficticio");
    expect(cities).toEqual([]);
  });

  it("es case-sensitive (no coincide con casing diferente)", () => {
    const cities = getCitiesByDepartment("antioquia");
    expect(cities).toEqual([]);
  });

  it("retorna ciudades para Bogotá D.C.", () => {
    const cities = getCitiesByDepartment("Bogotá D.C.");
    expect(cities).toEqual(["Bogotá"]);
  });

  it("retorna ciudades para Santander", () => {
    const cities = getCitiesByDepartment("Santander");
    expect(cities).toContain("Bucaramanga");
  });

  it("retorna ciudades para un departamento con pocas ciudades (Vaupés)", () => {
    const cities = getCitiesByDepartment("Vaupés");
    expect(cities).toHaveLength(3);
    expect(cities).toContain("Mitú");
  });
});
