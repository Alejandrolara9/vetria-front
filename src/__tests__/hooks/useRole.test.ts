import { renderHook, waitFor } from "@testing-library/react";
import { useRole } from "../../hooks/useRole";
import { api } from "../../services/api";

jest.mock("../../services/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockGet = api.get as jest.Mock;

describe("useRole", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("returns loading=true initially", () => {
    mockGet.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useRole());
    expect(result.current.loading).toBe(true);
    expect(result.current.role).toBeNull();
  });

  it("returns ADMIN role after successful fetch", async () => {
    mockGet.mockResolvedValue({ data: { role: "ADMIN" } });
    const { result } = renderHook(() => useRole());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBe("ADMIN");
  });

  it("returns VET role after successful fetch", async () => {
    mockGet.mockResolvedValue({ data: { role: "VET" } });
    const { result } = renderHook(() => useRole());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBe("VET");
  });

  it("returns RECEPTIONIST role after successful fetch", async () => {
    mockGet.mockResolvedValue({ data: { role: "RECEPTIONIST" } });
    const { result } = renderHook(() => useRole());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBe("RECEPTIONIST");
  });

  it("returns null role for unknown role value", async () => {
    mockGet.mockResolvedValue({ data: { role: "SUPERADMIN" } });
    const { result } = renderHook(() => useRole());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBeNull();
  });

  it("returns null role on fetch error", async () => {
    mockGet.mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useRole());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBeNull();
  });
});
