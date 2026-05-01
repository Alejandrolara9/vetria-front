import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import {
  createReminder,
  listReminders,
  getReminderStats,
  getUpcomingReminders,
  getOverdueReminders,
  getReminderById,
  updateReminder,
  getAllNotifications,
} from "../../services/reminders";

const mock = new MockAdapter(api);
const reminder = {
  id: "r1",
  petId: "p1",
  eventType: "VACCINE" as const,
  status: "SCHEDULED" as const,
  calculatedDueDate: "2026-06-01",
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
};

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

describe("createReminder", () => {
  it("POSTs to /reminders", async () => {
    mock.onPost("/reminders").reply(201, reminder);
    const result = await createReminder({ petId: "p1", eventType: "VACCINE", calculatedDueDate: "2026-06-01" });
    expect(result).toEqual(reminder);
  });
});

describe("listReminders", () => {
  it("GETs /reminders without params when no status", async () => {
    mock.onGet("/reminders").reply(200, [reminder]);
    const result = await listReminders();
    expect(result).toEqual([reminder]);
    expect(mock.history.get[0].params).toEqual({});
  });

  it("GETs /reminders with status param", async () => {
    mock.onGet("/reminders").reply(200, [reminder]);
    await listReminders("SCHEDULED");
    expect(mock.history.get[0].params).toEqual({ status: "SCHEDULED" });
  });
});

describe("getReminderStats", () => {
  it("GETs /reminders/stats", async () => {
    const stats = { total: 10, upcoming: 3, overdue: 1, notificationsSentToday: 2 };
    mock.onGet("/reminders/stats").reply(200, stats);
    expect(await getReminderStats()).toEqual(stats);
  });
});

describe("getUpcomingReminders", () => {
  it("GETs /reminders/upcoming with default days=7", async () => {
    mock.onGet("/reminders/upcoming").reply(200, [reminder]);
    await getUpcomingReminders();
    expect(mock.history.get[0].params).toEqual({ days: 7 });
  });

  it("GETs /reminders/upcoming with custom days", async () => {
    mock.onGet("/reminders/upcoming").reply(200, [reminder]);
    await getUpcomingReminders(14);
    expect(mock.history.get[0].params).toEqual({ days: 14 });
  });
});

describe("getOverdueReminders", () => {
  it("GETs /reminders/overdue", async () => {
    mock.onGet("/reminders/overdue").reply(200, [reminder]);
    expect(await getOverdueReminders()).toEqual([reminder]);
  });
});

describe("getReminderById", () => {
  it("GETs /reminders/:id", async () => {
    mock.onGet("/reminders/r1").reply(200, reminder);
    expect(await getReminderById("r1")).toEqual(reminder);
  });
});

describe("updateReminder", () => {
  it("PUTs to /reminders/:id", async () => {
    mock.onPut("/reminders/r1").reply(200, { ...reminder, status: "CANCELLED" });
    const result = await updateReminder("r1", { status: "CANCELLED" });
    expect(result.status).toBe("CANCELLED");
  });
});

describe("getAllNotifications", () => {
  it("GETs /reminders/notifications/all", async () => {
    const notification = { id: "n1", reminderId: "r1", stage: "PRE_DUE" as const, channel: "EMAIL" as const, status: "PENDING" as const, scheduledAt: "" };
    mock.onGet("/reminders/notifications/all").reply(200, [notification]);
    expect(await getAllNotifications()).toEqual([notification]);
  });
});
