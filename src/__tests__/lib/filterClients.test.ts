import { filterClients } from "../../lib/filterClients";

const clients = [
  {
    id: "1", name: "Carlos Ramírez", phone: "3112345678", email: "carlos@mail.com", createdAt: "",
    pets: [
      { id: "p1", name: "Max", species: "Canino", breed: "Labrador", birthDate: null },
      { id: "p2", name: "Luna", species: "Felino", breed: "Siamés", birthDate: null },
    ],
  },
  {
    id: "2", name: "Ana Torres", phone: "3009876543", email: "ana@mail.com", createdAt: "",
    pets: [
      { id: "p3", name: "Coco", species: "Roedor", breed: null, birthDate: null },
    ],
  },
  {
    id: "3", name: "Pedro Gómez", phone: "3154567890", email: "", createdAt: "",
    pets: [],
  },
];

describe("filterClients", () => {
  it("returns all clients when search is empty", () => {
    expect(filterClients(clients, "")).toHaveLength(3);
  });

  it("returns all clients when search is whitespace only", () => {
    expect(filterClients(clients, "   ")).toHaveLength(3);
  });

  it("filters by client name", () => {
    const result = filterClients(clients, "carlos");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by client phone", () => {
    const result = filterClients(clients, "311");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by client email", () => {
    const result = filterClients(clients, "ana@mail");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters by pet name", () => {
    const result = filterClients(clients, "luna");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by pet species", () => {
    const result = filterClients(clients, "felino");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by pet breed", () => {
    const result = filterClients(clients, "labrador");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns client when any pet matches", () => {
    const result = filterClients(clients, "coco");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("returns empty array when nothing matches", () => {
    expect(filterClients(clients, "xyz999")).toHaveLength(0);
  });

  it("is case-insensitive", () => {
    expect(filterClients(clients, "LABRADOR")).toHaveLength(1);
  });

  it("returns client with no pets when client name matches", () => {
    const result = filterClients(clients, "pedro");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("does not match string 'null' when breed is null", () => {
    const result = filterClients(clients, "null");
    expect(result).toHaveLength(0);
  });
});
