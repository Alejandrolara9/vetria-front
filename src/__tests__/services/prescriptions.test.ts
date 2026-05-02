import { listPrescriptions, getPrescription, createPrescription, updatePrescription, deletePrescription, generatePdf, sendPrescription } from "@/services/prescriptions";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const MOCK_ITEM = {
  id: "item-1",
  prescriptionId: "rx-1",
  productId: null,
  productName: "Amoxicilina 500mg",
  quantity: "20 tabletas",
  instructions: "1 tableta cada 12h durante 10 días",
  order: 0,
};

const MOCK_PRESCRIPTION = {
  id: "rx-1",
  tenantId: "t-1",
  petId: "pet-1",
  vetId: "vet-1",
  issueDate: "2026-05-01T00:00:00.000Z",
  nextControlDate: null,
  observations: null,
  status: "DRAFT" as const,
  pdfUrl: null,
  emailSentAt: null,
  reminderId: null,
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
  items: [MOCK_ITEM],
  pet: { id: "pet-1", name: "Luna", species: "DOG", breed: "Labrador", birthDate: null, client: { id: "c-1", name: "Juan García", phone: "3001234567", email: "juan@example.com" } },
  vet: { id: "vet-1", name: "Dra. López", signatureUrl: null, licenseNumber: "39068" },
  tenant: { id: "t-1", name: "Clínica Vetria", logoUrl: null, primaryColor: "#1e40af", clinicPhone: null, clinicAddress: null, clinicCity: null },
};

beforeEach(() => jest.clearAllMocks());

describe("listPrescriptions", () => {
  it("calls GET /prescriptions without filters", async () => {
    mockApi.get.mockResolvedValueOnce({ data: [MOCK_PRESCRIPTION] });
    const result = await listPrescriptions();
    expect(mockApi.get).toHaveBeenCalledWith("/prescriptions");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("rx-1");
  });

  it("passes query string filters", async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });
    await listPrescriptions({ status: "SENT", petId: "pet-1" });
    expect(mockApi.get).toHaveBeenCalledWith("/prescriptions?petId=pet-1&status=SENT");
  });
});

describe("getPrescription", () => {
  it("calls GET /prescriptions/:id", async () => {
    mockApi.get.mockResolvedValueOnce({ data: MOCK_PRESCRIPTION });
    const result = await getPrescription("rx-1");
    expect(mockApi.get).toHaveBeenCalledWith("/prescriptions/rx-1");
    expect(result.id).toBe("rx-1");
  });
});

describe("createPrescription", () => {
  it("calls POST /prescriptions with body", async () => {
    mockApi.post.mockResolvedValueOnce({ data: MOCK_PRESCRIPTION });
    const dto = { petId: "pet-1", items: [{ productName: "Amoxicilina", quantity: "20", instructions: "1 cada 12h", order: 0 }] };
    const result = await createPrescription(dto);
    expect(mockApi.post).toHaveBeenCalledWith("/prescriptions", dto);
    expect(result.status).toBe("DRAFT");
  });
});

describe("updatePrescription", () => {
  it("calls PATCH /prescriptions/:id", async () => {
    const updated = { ...MOCK_PRESCRIPTION, observations: "Mantener hidratado" };
    mockApi.patch.mockResolvedValueOnce({ data: updated });
    const result = await updatePrescription("rx-1", { observations: "Mantener hidratado" });
    expect(mockApi.patch).toHaveBeenCalledWith("/prescriptions/rx-1", { observations: "Mantener hidratado" });
    expect(result.observations).toBe("Mantener hidratado");
  });
});

describe("deletePrescription", () => {
  it("calls DELETE /prescriptions/:id", async () => {
    mockApi.delete.mockResolvedValueOnce({ data: undefined });
    await deletePrescription("rx-1");
    expect(mockApi.delete).toHaveBeenCalledWith("/prescriptions/rx-1");
  });
});

describe("generatePdf", () => {
  it("calls POST /prescriptions/:id/pdf", async () => {
    const printed = { ...MOCK_PRESCRIPTION, status: "PRINTED" as const, pdfUrl: "https://s3.example.com/rx.pdf" };
    mockApi.post.mockResolvedValueOnce({ data: printed });
    const result = await generatePdf("rx-1");
    expect(mockApi.post).toHaveBeenCalledWith("/prescriptions/rx-1/pdf");
    expect(result.status).toBe("PRINTED");
    expect(result.pdfUrl).toBeTruthy();
  });
});

describe("sendPrescription", () => {
  it("calls POST /prescriptions/:id/send", async () => {
    const sent = { ...MOCK_PRESCRIPTION, status: "SENT" as const, emailSentAt: "2026-05-01T10:00:00.000Z" };
    mockApi.post.mockResolvedValueOnce({ data: sent });
    const result = await sendPrescription("rx-1");
    expect(mockApi.post).toHaveBeenCalledWith("/prescriptions/rx-1/send");
    expect(result.status).toBe("SENT");
    expect(result.emailSentAt).toBeTruthy();
  });
});
