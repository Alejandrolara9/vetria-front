import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import {
  listProtocols,
  getProtocol,
  createProtocol,
  updateProtocol,
  deleteProtocol,
} from "../../services/protocols";

const mock = new MockAdapter(api);
const protocol = {
  id: "pr1",
  name: "Rabia Canina",
  vaccineType: "Rabia",
  species: "Canino",
  breed: null,
  minAgeDays: null,
  maxAgeDays: null,
  minWeightKg: null,
  intervalDays: 365,
  preReminderDays: 30,
  postReminderDays: 7,
  customMessage: null,
  active: true,
  tenantId: "t1",
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
};

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

describe("listProtocols", () => {
  it("GETs /vaccination-protocols", async () => {
    mock.onGet("/vaccination-protocols").reply(200, [protocol]);
    expect(await listProtocols()).toEqual([protocol]);
  });
});

describe("getProtocol", () => {
  it("GETs /vaccination-protocols/:id", async () => {
    mock.onGet("/vaccination-protocols/pr1").reply(200, protocol);
    expect(await getProtocol("pr1")).toEqual(protocol);
  });
});

describe("createProtocol", () => {
  it("POSTs to /vaccination-protocols", async () => {
    mock.onPost("/vaccination-protocols").reply(201, protocol);
    const result = await createProtocol({
      name: "Rabia Canina",
      vaccineType: "Rabia",
      species: "Canino",
      preReminderDays: 30,
      postReminderDays: 7,
    });
    expect(result).toEqual(protocol);
  });
});

describe("updateProtocol", () => {
  it("PUTs to /vaccination-protocols/:id", async () => {
    mock.onPut("/vaccination-protocols/pr1").reply(200, { ...protocol, active: false });
    const result = await updateProtocol("pr1", { active: false });
    expect(result.active).toBe(false);
  });
});

describe("deleteProtocol", () => {
  it("DELETEs /vaccination-protocols/:id", async () => {
    mock.onDelete("/vaccination-protocols/pr1").reply(204);
    await expect(deleteProtocol("pr1")).resolves.toBeUndefined();
  });
});
