import MockAdapter from "axios-mock-adapter";
import { ownerApi } from "../../services/owner-portal";
import {
  validateInviteToken,
  acceptInvite,
  ownerLogin,
  ownerGoogleAuth,
  getOwnerPets,
  getPetEvents,
  getPetNotes,
  getPetReminders,
  inviteClientToPortal,
  saveOwnerToken,
  clearOwnerToken,
  getOwnerToken,
  translateEventType,
  type OwnerPet,
  type PetEvent,
  type PetNote,
  type PetReminder,
} from "../../services/owner-portal";

// Mock del módulo api usado por inviteClientToPortal (import dinámico interno)
jest.mock("../../services/api", () => ({
  api: {
    post: jest.fn(),
  },
}));

const mock = new MockAdapter(ownerApi);

const petFixture: OwnerPet = {
  id: "pet-1",
  name: "Max",
  species: "Canino",
  breed: "Labrador",
  birthDate: "2020-03-15",
  tenant: { name: "Clínica Vet Test" },
};

const eventFixture: PetEvent = {
  id: "evt-1",
  type: "VACCINE",
  title: "Antirrábica",
  description: "Vacuna aplicada sin incidentes",
  appliedDate: "2026-01-10",
  nextDueDate: "2027-01-10",
};

const noteFixture: PetNote = {
  id: "note-1",
  chiefComplaint: "Vómito recurrente",
  finalNote: "Gastritis leve. Tratamiento con omeprazol.",
  approvedAt: "2026-02-01T10:00:00Z",
  tenant: { name: "Clínica Vet Test" },
};

const reminderFixture: PetReminder = {
  id: "rem-1",
  eventType: "VACCINE",
  calculatedDueDate: "2027-01-10T00:00:00Z",
  notes: "Recordatorio anual de rabia",
};

beforeEach(() => {
  mock.reset();
  // Limpiar localStorage entre tests
  if (typeof window !== "undefined") {
    localStorage.clear();
  }
});
afterAll(() => mock.restore());

// ─── Auth ──────────────────────────────────────────────────────────────────────

describe("validateInviteToken", () => {
  it("POSTea /portal/auth/validate-invite con el token en el body y retorna el email asociado", async () => {
    mock.onPost("/portal/auth/validate-invite").reply(200, { email: "dueño@email.co" });
    const result = await validateInviteToken("token123");
    expect(result.email).toBe("dueño@email.co");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ token: "token123" });
  });

  it("propaga error si el token es inválido o expirado", async () => {
    mock.onPost("/portal/auth/validate-invite").reply(404, { message: "Token expirado" });
    await expect(validateInviteToken("expired")).rejects.toThrow();
  });
});

describe("acceptInvite", () => {
  it("POSTea /portal/auth/accept-invite con los datos del dueño", async () => {
    const response = {
      token: "owner-jwt-abc",
      owner: { id: "owner-1", name: "Carlos López", email: "carlos@email.co" },
    };
    mock.onPost("/portal/auth/accept-invite").reply(201, response);

    const result = await acceptInvite({
      token: "invite-token",
      name: "Carlos López",
      password: "Segura123!",
    });

    expect(result.token).toBe("owner-jwt-abc");
    expect(result.owner.name).toBe("Carlos López");
    expect(JSON.parse(mock.history.post[0].data)).toMatchObject({
      token: "invite-token",
      name: "Carlos López",
    });
  });
});

describe("ownerLogin", () => {
  it("POSTea /portal/auth/login y retorna token + owner", async () => {
    const response = {
      token: "owner-jwt-xyz",
      owner: { id: "owner-2", name: "María Torres", email: "maria@email.co" },
    };
    mock.onPost("/portal/auth/login").reply(200, response);

    const result = await ownerLogin({ email: "maria@email.co", password: "Clave456!" });

    expect(result.token).toBe("owner-jwt-xyz");
    expect(result.owner.email).toBe("maria@email.co");
  });

  it("propaga error si las credenciales son incorrectas", async () => {
    mock.onPost("/portal/auth/login").reply(401, { message: "Credenciales inválidas" });
    await expect(ownerLogin({ email: "x@x.com", password: "mala" })).rejects.toThrow();
  });
});

describe("ownerGoogleAuth", () => {
  it("POSTea /portal/auth/google con el idToken de Google", async () => {
    const response = {
      token: "owner-jwt-google",
      owner: { id: "owner-3", name: "Pedro Ruiz", email: "pedro@gmail.com" },
    };
    mock.onPost("/portal/auth/google").reply(200, response);

    const result = await ownerGoogleAuth("google-id-token-abc");

    expect(result.token).toBe("owner-jwt-google");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ idToken: "google-id-token-abc" });
  });
});

// ─── Portal ────────────────────────────────────────────────────────────────────

describe("getOwnerPets", () => {
  it("GETs /portal/pets y retorna el listado de mascotas del dueño", async () => {
    mock.onGet("/portal/pets").reply(200, [petFixture]);
    const result = await getOwnerPets();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Max");
    expect(result[0].tenant.name).toBe("Clínica Vet Test");
  });

  it("retorna arreglo vacío si el dueño no tiene mascotas", async () => {
    mock.onGet("/portal/pets").reply(200, []);
    const result = await getOwnerPets();
    expect(result).toEqual([]);
  });
});

describe("getPetEvents", () => {
  it("GETs /portal/pets/:id/events y retorna los eventos clínicos", async () => {
    mock.onGet("/portal/pets/pet-1/events").reply(200, [eventFixture]);
    const result = await getPetEvents("pet-1");
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("VACCINE");
    expect(result[0].nextDueDate).toBe("2027-01-10");
  });
});

describe("getPetNotes", () => {
  it("GETs /portal/pets/:id/notes y retorna las historias clínicas aprobadas", async () => {
    mock.onGet("/portal/pets/pet-1/notes").reply(200, [noteFixture]);
    const result = await getPetNotes("pet-1");
    expect(result).toHaveLength(1);
    expect(result[0].chiefComplaint).toBe("Vómito recurrente");
    expect(result[0].approvedAt).not.toBeNull();
  });
});

describe("getPetReminders", () => {
  it("GETs /portal/pets/:id/reminders y retorna los recordatorios pendientes", async () => {
    mock.onGet("/portal/pets/pet-1/reminders").reply(200, [reminderFixture]);
    const result = await getPetReminders("pet-1");
    expect(result).toHaveLength(1);
    expect(result[0].eventType).toBe("VACCINE");
    expect(result[0].calculatedDueDate).toBe("2027-01-10T00:00:00Z");
  });
});

// ─── Helpers de token ──────────────────────────────────────────────────────────

describe("saveOwnerToken / getOwnerToken / clearOwnerToken", () => {
  it("guarda y recupera el token del localStorage", () => {
    saveOwnerToken("mi-token-portal");
    expect(getOwnerToken()).toBe("mi-token-portal");
  });

  it("retorna null si no hay token guardado", () => {
    // localStorage fue limpiado en beforeEach
    expect(getOwnerToken()).toBeNull();
  });

  it("clearOwnerToken elimina el token del localStorage", () => {
    saveOwnerToken("token-a-eliminar");
    clearOwnerToken();
    expect(getOwnerToken()).toBeNull();
  });
});

// ─── inviteClientToPortal ──────────────────────────────────────────────────────

describe("inviteClientToPortal", () => {
  it("POSTea al endpoint de invitación usando el api veterinario", async () => {
    const { api } = await import("../../services/api");
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { message: "Invitación enviada con éxito" },
    });

    const result = await inviteClientToPortal("client-abc");
    expect(result.message).toBe("Invitación enviada con éxito");
    expect(api.post).toHaveBeenCalledWith("/users/clients/client-abc/invite-owner");
  });

  it("propaga el error si el cliente no existe", async () => {
    const { api } = await import("../../services/api");
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Cliente no encontrado" } },
    });

    await expect(inviteClientToPortal("no-existe")).rejects.toMatchObject({
      response: { data: { message: "Cliente no encontrado" } },
    });
  });
});

// ─── translateEventType ────────────────────────────────────────────────────────

describe("translateEventType", () => {
  it("traduce VACCINE a 'Vacunación'", () => {
    expect(translateEventType("VACCINE")).toBe("Vacunación");
  });

  it("traduce DEWORMING a 'Desparasitación'", () => {
    expect(translateEventType("DEWORMING")).toBe("Desparasitación");
  });

  it("traduce ANTIPARASITIC a 'Antiparasitario'", () => {
    expect(translateEventType("ANTIPARASITIC")).toBe("Antiparasitario");
  });

  it("traduce CHECKUP a 'Control'", () => {
    expect(translateEventType("CHECKUP")).toBe("Control");
  });

  it("traduce OTHER a 'Atención veterinaria'", () => {
    expect(translateEventType("OTHER")).toBe("Atención veterinaria");
  });

  it("retorna el valor original para tipos desconocidos", () => {
    expect(translateEventType("TIPO_DESCONOCIDO")).toBe("TIPO_DESCONOCIDO");
  });
});
