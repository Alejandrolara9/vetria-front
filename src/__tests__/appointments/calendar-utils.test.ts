import {
  calcDuration,
  isEndTimeValid,
  toCalendarEvent,
  dateToApiFields,
  getVisibleVetId,
} from "@/app/dashboard/appointments/calendar-utils";
import type { Appointment } from "@/services/appointments";

const BASE: Appointment = {
  id: "appt-1",
  tenantId: "t1",
  petId: "p1",
  clientId: "c1",
  vetId: "v1",
  title: "Consulta",
  date: "2026-05-15",
  startTime: "09:00",
  endTime: "10:30",
  status: "SCHEDULED",
  notes: null,
  cancelReason: null,
  createdAt: "2026-05-15T00:00:00Z",
  updatedAt: "2026-05-15T00:00:00Z",
  pet: { id: "p1", name: "Max", species: "Canino" },
  client: { id: "c1", name: "Juan" },
  vet: { id: "v1", name: "Dra. García" },
} as Appointment;

describe("calcDuration", () => {
  it("returns empty string when endTime equals startTime", () => {
    expect(calcDuration("09:00", "09:00")).toBe("");
  });
  it("returns empty string when endTime is before startTime", () => {
    expect(calcDuration("09:30", "09:00")).toBe("");
  });
  it("returns singular minute", () => {
    expect(calcDuration("09:00", "09:01")).toBe("1 minuto");
  });
  it("returns plural minutes when less than one hour", () => {
    expect(calcDuration("09:00", "09:45")).toBe("45 minutos");
  });
  it("returns singular hour when exact", () => {
    expect(calcDuration("09:00", "10:00")).toBe("1 hora");
  });
  it("returns plural hours when exact", () => {
    expect(calcDuration("09:00", "11:00")).toBe("2 horas");
  });
  it("returns hours and minutes", () => {
    expect(calcDuration("09:00", "10:30")).toBe("1 hora 30 minutos");
  });
});

describe("isEndTimeValid", () => {
  it("returns true when endTime is strictly after startTime", () => {
    expect(isEndTimeValid("09:00", "10:30")).toBe(true);
  });
  it("returns false when endTime equals startTime", () => {
    expect(isEndTimeValid("09:00", "09:00")).toBe(false);
  });
  it("returns false when endTime is before startTime", () => {
    expect(isEndTimeValid("10:00", "09:00")).toBe(false);
  });
});

describe("toCalendarEvent", () => {
  it("sets correct start and end Date objects", () => {
    const event = toCalendarEvent(BASE);
    expect(event.id).toBe("appt-1");
    expect(event.title).toBe("Consulta");
    expect(event.start.getFullYear()).toBe(2026);
    expect(event.start.getMonth()).toBe(4); // Mayo = índice 4
    expect(event.start.getDate()).toBe(15);
    expect(event.start.getHours()).toBe(9);
    expect(event.start.getMinutes()).toBe(0);
    expect(event.end.getHours()).toBe(10);
    expect(event.end.getMinutes()).toBe(30);
    expect(event.resource).toBe(BASE);
  });
});

describe("dateToApiFields", () => {
  it("converts Date objects to API string format", () => {
    const start = new Date(2026, 4, 15, 9, 0);
    const end = new Date(2026, 4, 15, 10, 30);
    expect(dateToApiFields(start, end)).toEqual({
      date: "2026-05-15",
      startTime: "09:00",
      endTime: "10:30",
    });
  });
  it("pads single-digit month, day, hour, minute", () => {
    const start = new Date(2026, 0, 5, 8, 5); // Jan 5, 08:05
    const end = new Date(2026, 0, 5, 9, 0);
    expect(dateToApiFields(start, end)).toEqual({
      date: "2026-01-05",
      startTime: "08:05",
      endTime: "09:00",
    });
  });
});

describe("getVisibleVetId", () => {
  it("VET always returns own id", () => {
    expect(getVisibleVetId("VET", "user-1", "other")).toBe("user-1");
    expect(getVisibleVetId("VET", "user-1", "all")).toBe("user-1");
    expect(getVisibleVetId("VET", "user-1", "")).toBe("user-1");
  });
  it("ADMIN with 'all' returns undefined (no filter)", () => {
    expect(getVisibleVetId("ADMIN", "user-1", "all")).toBeUndefined();
  });
  it("ADMIN with specific vet returns that vet id", () => {
    expect(getVisibleVetId("ADMIN", "user-1", "vet-2")).toBe("vet-2");
  });
  it("RECEPTIONIST with vet selected returns that vet id", () => {
    expect(getVisibleVetId("RECEPTIONIST", "user-1", "vet-2")).toBe("vet-2");
  });
  it("RECEPTIONIST with empty returns undefined", () => {
    expect(getVisibleVetId("RECEPTIONIST", "user-1", "")).toBeUndefined();
  });
});
