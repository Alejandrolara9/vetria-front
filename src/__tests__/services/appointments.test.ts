import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import {
  createAppointment,
  listAppointments,
  getAppointmentStatsToday,
  getVetSchedule,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
  deleteAppointment,
} from "../../services/appointments";

const mock = new MockAdapter(api);
const appt = {
  id: "a1",
  petId: "p1",
  clientId: "c1",
  vetId: "v1",
  title: "Consulta",
  date: "2026-05-01",
  startTime: "09:00",
  endTime: "09:30",
  status: "SCHEDULED" as const,
  notes: null,
  cancelReason: null,
  pet: { id: "p1", name: "Max", species: "Canino" },
  client: { id: "c1", name: "Juan" },
  vet: { id: "v1", name: "Dra. Lopez" },
  createdAt: "2026-05-01T00:00:00Z",
};

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

describe("createAppointment", () => {
  it("POSTs to /appointments and returns the created appointment", async () => {
    mock.onPost("/appointments").reply(201, appt);
    const result = await createAppointment({
      petId: "p1", clientId: "c1", vetId: "v1",
      title: "Consulta", date: "2026-05-01", startTime: "09:00", endTime: "09:30",
    });
    expect(result).toEqual(appt);
  });
});

describe("listAppointments", () => {
  it("GETs /appointments without params", async () => {
    mock.onGet("/appointments").reply(200, { data: [appt] });
    const result = await listAppointments();
    expect(result).toEqual([appt]);
    expect(mock.history.get[0].params).toEqual({ limit: 9999 });
  });

  it("GETs /appointments with query params", async () => {
    mock.onGet("/appointments").reply(200, { data: [appt] });
    const result = await listAppointments({ date: "2026-05-01", status: "SCHEDULED" });
    expect(result).toEqual([appt]);
    expect(mock.history.get[0].params).toEqual({ limit: 9999, date: "2026-05-01", status: "SCHEDULED" });
  });
});

describe("getAppointmentStatsToday", () => {
  it("GETs /appointments/stats/today", async () => {
    const stats = { total: 5, confirmed: 2, completed: 1, pending: 2 };
    mock.onGet("/appointments/stats/today").reply(200, stats);
    expect(await getAppointmentStatsToday()).toEqual(stats);
  });
});

describe("getVetSchedule", () => {
  it("GETs /appointments/vet/:id/schedule with date param", async () => {
    mock.onGet("/appointments/vet/v1/schedule").reply(200, [appt]);
    const result = await getVetSchedule("v1", "2026-05-01");
    expect(result).toEqual([appt]);
    expect(mock.history.get[0].params).toEqual({ date: "2026-05-01" });
  });
});

describe("getAppointment", () => {
  it("GETs /appointments/:id", async () => {
    mock.onGet("/appointments/a1").reply(200, appt);
    expect(await getAppointment("a1")).toEqual(appt);
  });
});

describe("updateAppointment", () => {
  it("PUTs to /appointments/:id", async () => {
    mock.onPut("/appointments/a1").reply(200, { ...appt, title: "Updated" });
    const result = await updateAppointment("a1", { title: "Updated" });
    expect(result.title).toBe("Updated");
  });
});

describe("cancelAppointment", () => {
  it("PATCHes /appointments/:id/cancel with reason", async () => {
    mock.onPatch("/appointments/a1/cancel").reply(200, { ...appt, status: "CANCELLED" });
    const result = await cancelAppointment("a1", "Client cancelled");
    expect(result.status).toBe("CANCELLED");
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ reason: "Client cancelled" });
  });
});

describe("confirmAppointment", () => {
  it("PATCHes /appointments/:id/confirm", async () => {
    mock.onPatch("/appointments/a1/confirm").reply(200, { ...appt, status: "CONFIRMED" });
    const result = await confirmAppointment("a1");
    expect(result.status).toBe("CONFIRMED");
  });
});

describe("completeAppointment", () => {
  it("PATCHes /appointments/:id/complete", async () => {
    mock.onPatch("/appointments/a1/complete").reply(200, { ...appt, status: "COMPLETED" });
    const result = await completeAppointment("a1");
    expect(result.status).toBe("COMPLETED");
  });
});

describe("deleteAppointment", () => {
  it("DELETEs /appointments/:id", async () => {
    mock.onDelete("/appointments/a1").reply(204);
    await expect(deleteAppointment("a1")).resolves.toBeUndefined();
  });
});
