import { parseLocalDate } from "../../lib/date-utils";

describe("parseLocalDate", () => {
  it("parses a date-only string to local midnight (same calendar day)", () => {
    const d = parseLocalDate("2024-03-15");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2); // 0-indexed → March
    expect(d.getDate()).toBe(15);
  });

  it("time components are zero for a date-only string", () => {
    const d = parseLocalDate("2024-03-15");
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });

  it("passes through a full ISO timestamp unchanged", () => {
    const iso = "2024-03-15T14:30:00.000Z";
    const d = parseLocalDate(iso);
    expect(d.getTime()).toBe(new Date(iso).getTime());
  });

  it("passes through an ISO string with T and timezone offset", () => {
    const iso = "2024-03-15T10:00:00-05:00";
    const d = parseLocalDate(iso);
    expect(d.getTime()).toBe(new Date(iso).getTime());
  });

  it("handles month and day boundaries correctly", () => {
    const d = parseLocalDate("2024-12-31");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(11); // December
    expect(d.getDate()).toBe(31);
  });

  it("handles leap-year date without off-by-one", () => {
    const d = parseLocalDate("2024-02-29");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(1); // February
    expect(d.getDate()).toBe(29);
  });
});
