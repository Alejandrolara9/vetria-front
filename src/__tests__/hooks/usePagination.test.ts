import { renderHook, act, waitFor } from "@testing-library/react";
import { usePagination } from "../../hooks/usePagination";

const makeFetch = (items: string[], total: number) =>
  jest.fn().mockResolvedValue({ data: items, total, page: 1, totalPages: Math.ceil(total / 20) });

describe("usePagination", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("loads first page on mount", async () => {
    const fetchFn = makeFetch(["a", "b"], 2);
    const { result } = renderHook(() => usePagination({ fetchFn }));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(["a", "b"]);
    expect(result.current.total).toBe(2);
  });

  it("resets to page 1 when search changes", async () => {
    const fetchFn = makeFetch(["x"], 1);
    const { result } = renderHook(() => usePagination({ fetchFn }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.setPage(3); });
    await waitFor(() => expect(result.current.page).toBe(3));

    act(() => { result.current.setSearch("hola"); });
    // debounce delay
    act(() => { jest.advanceTimersByTime(300); });
    await waitFor(() => expect(result.current.page).toBe(1));
  });

  it("debounces search — does not call fetchFn on every keystroke", async () => {
    const fetchFn = makeFetch([], 0);
    const { result } = renderHook(() => usePagination({ fetchFn }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = fetchFn.mock.calls.length;
    act(() => { result.current.setSearch("a"); });
    act(() => { result.current.setSearch("ab"); });
    act(() => { result.current.setSearch("abc"); });
    // Should not have called yet
    expect(fetchFn.mock.calls.length).toBe(callsBefore);
    // After debounce fires
    act(() => { jest.advanceTimersByTime(300); });
    await waitFor(() => expect(fetchFn.mock.calls.length).toBeGreaterThan(callsBefore));
  });
});
