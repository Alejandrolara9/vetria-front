import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import {
  getMyProfile,
  updateMyProfile,
  setMyPassword,
  uploadMySignature,
  type UserProfile,
} from "../../services/user-profile";

const mock = new MockAdapter(api);

const profileFixture: UserProfile = {
  id: "user-1",
  name: "Dr. Andrés García",
  email: "andres@clinica.co",
  role: "VET",
  tenantId: "tenant-1",
  signatureUrl: null,
  licenseNumber: "COL-12345",
  hasPassword: true,
};

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

describe("getMyProfile", () => {
  it("GETs /users/me y retorna el perfil del usuario autenticado", async () => {
    mock.onGet("/users/me").reply(200, profileFixture);
    const result = await getMyProfile();
    expect(result).toEqual(profileFixture);
    expect(result.role).toBe("VET");
  });

  it("propaga el error si el token es inválido", async () => {
    mock.onGet("/users/me").reply(401);
    await expect(getMyProfile()).rejects.toThrow();
  });
});

describe("updateMyProfile", () => {
  it("PATCHes /users/me/profile con el número de licencia", async () => {
    const updated = { ...profileFixture, licenseNumber: "COL-99999" };
    mock.onPatch("/users/me/profile").reply(200, updated);

    const result = await updateMyProfile({ licenseNumber: "COL-99999" });
    expect(result.licenseNumber).toBe("COL-99999");
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ licenseNumber: "COL-99999" });
  });

  it("permite actualizar sin campos (objeto vacío)", async () => {
    mock.onPatch("/users/me/profile").reply(200, profileFixture);
    const result = await updateMyProfile({});
    expect(result).toEqual(profileFixture);
  });
});

describe("setMyPassword", () => {
  it("PATCHes /users/me/password con nueva contraseña", async () => {
    mock.onPatch("/users/me/password").reply(204);
    await expect(
      setMyPassword({ currentPassword: "antigua", newPassword: "NuevaClave123!" })
    ).resolves.toBeUndefined();
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({
      currentPassword: "antigua",
      newPassword: "NuevaClave123!",
    });
  });

  it("permite establecer contraseña sin currentPassword (primer acceso con OAuth)", async () => {
    mock.onPatch("/users/me/password").reply(204);
    await expect(
      setMyPassword({ newPassword: "PrimeraClave456!" })
    ).resolves.toBeUndefined();
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({
      newPassword: "PrimeraClave456!",
    });
  });

  it("propaga el error si la contraseña actual es incorrecta", async () => {
    mock.onPatch("/users/me/password").reply(400, { message: "Contraseña actual incorrecta" });
    await expect(
      setMyPassword({ currentPassword: "incorrecta", newPassword: "Nueva123!" })
    ).rejects.toThrow();
  });
});

describe("uploadMySignature", () => {
  it("POSTea la firma a /users/me/signature y retorna la key", async () => {
    mock.onPost("/users/me/signature").reply(201, { key: "uploads/firma-user1.png" });

    const file = new File(["firma"], "firma.png", { type: "image/png" });
    const result = await uploadMySignature(file);

    expect(result.key).toBe("uploads/firma-user1.png");
    expect(mock.history.post[0].url).toBe("/users/me/signature");
  });

  it("envía el archivo como multipart/form-data con el campo 'file'", async () => {
    mock.onPost("/users/me/signature").reply(201, { key: "uploads/sig.png" });

    const file = new File(["datos"], "sig.png", { type: "image/png" });
    await uploadMySignature(file);

    expect(mock.history.post[0].headers?.["Content-Type"]).toContain("multipart/form-data");
  });
});
