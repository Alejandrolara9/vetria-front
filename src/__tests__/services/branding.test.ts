import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import {
  getBranding,
  updateBranding,
  uploadBrandingAsset,
  type BrandingConfig,
  type UpdateBrandingDto,
} from "../../services/branding";

const mock = new MockAdapter(api);

const brandingFixture: BrandingConfig = {
  id: "tenant-1",
  name: "Clínica Veterinaria Test",
  logoUrl: null,
  primaryColor: "#3B82F6",
  defaultSignatureUrl: null,
  watermarkUrl: null,
  watermarkOpacity: 0.3,
  watermarkEnabled: false,
  clinicPhone: "3001234567",
  clinicAddress: "Calle 1 # 2-3",
  clinicCity: "Bogotá",
  clinicDepartment: "Bogotá D.C.",
};

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

describe("getBranding", () => {
  it("GETs /tenants/me/branding y retorna la configuración", async () => {
    mock.onGet("/tenants/me/branding").reply(200, brandingFixture);
    const result = await getBranding();
    expect(result).toEqual(brandingFixture);
  });

  it("propaga el error si la petición falla", async () => {
    mock.onGet("/tenants/me/branding").reply(401, { message: "Unauthorized" });
    await expect(getBranding()).rejects.toThrow();
  });
});

describe("updateBranding", () => {
  it("PATCHes /tenants/me/branding con los datos actualizados", async () => {
    const update: UpdateBrandingDto = { primaryColor: "#EF4444", watermarkEnabled: true };
    const updated = { ...brandingFixture, ...update };
    mock.onPatch("/tenants/me/branding").reply(200, updated);

    const result = await updateBranding(update);
    expect(result.primaryColor).toBe("#EF4444");
    expect(result.watermarkEnabled).toBe(true);
    expect(JSON.parse(mock.history.patch[0].data)).toMatchObject(update);
  });

  it("actualiza parcialmente solo los campos enviados", async () => {
    const update: UpdateBrandingDto = { clinicPhone: "3109876543" };
    mock.onPatch("/tenants/me/branding").reply(200, { ...brandingFixture, ...update });

    const result = await updateBranding(update);
    expect(result.clinicPhone).toBe("3109876543");
    // El resto de campos permanece igual
    expect(result.name).toBe(brandingFixture.name);
  });
});

describe("uploadBrandingAsset", () => {
  it("POSTea logo al endpoint correcto y retorna la key", async () => {
    mock.onPost("/tenants/me/branding/logo").reply(201, { key: "uploads/logo-123.png" });

    const file = new File(["contenido"], "logo.png", { type: "image/png" });
    const result = await uploadBrandingAsset("logo", file);

    expect(result.key).toBe("uploads/logo-123.png");
    expect(mock.history.post[0].url).toBe("/tenants/me/branding/logo");
  });

  it("POSTea firma (signature) al endpoint correcto", async () => {
    mock.onPost("/tenants/me/branding/signature").reply(201, { key: "uploads/sig-456.png" });

    const file = new File(["datos"], "firma.png", { type: "image/png" });
    const result = await uploadBrandingAsset("signature", file);

    expect(result.key).toBe("uploads/sig-456.png");
    expect(mock.history.post[0].url).toBe("/tenants/me/branding/signature");
  });

  it("POSTea watermark al endpoint correcto", async () => {
    mock.onPost("/tenants/me/branding/watermark").reply(201, { key: "uploads/wm-789.png" });

    const file = new File(["marca"], "watermark.png", { type: "image/png" });
    const result = await uploadBrandingAsset("watermark", file);

    expect(result.key).toBe("uploads/wm-789.png");
    expect(mock.history.post[0].url).toBe("/tenants/me/branding/watermark");
  });

  it("envía el archivo como multipart/form-data", async () => {
    mock.onPost("/tenants/me/branding/logo").reply(201, { key: "test.png" });

    const file = new File(["x"], "x.png", { type: "image/png" });
    await uploadBrandingAsset("logo", file);

    // axios-mock-adapter recibe FormData; verificamos que se usó el header correcto
    expect(mock.history.post[0].headers?.["Content-Type"]).toContain("multipart/form-data");
  });
});
