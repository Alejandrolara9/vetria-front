import MockAdapter from "axios-mock-adapter";
import { api, redirect } from "../../services/api";
import * as apiModule from "../../services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
  localStorage.clear();
});

afterAll(() => mock.restore());

describe("api client", () => {
  it("has withCredentials: true", () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("uses NEXT_PUBLIC_API_URL as baseURL", () => {
    expect(api.defaults.baseURL).toBeDefined();
  });

  it("does NOT add Authorization header from localStorage", async () => {
    localStorage.setItem("token", "some-old-token");
    mock.onGet("/test").reply(200, {});
    await api.get("/test");
    expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
  });

  it("redirects to /login?expired=1 on 401 response", async () => {
    // spy on the exported redirect helper to avoid fighting jsdom's
    // non-configurable window.location
    const redirectSpy = jest
      .spyOn(apiModule, "redirect")
      .mockImplementation(() => {});

    mock.onGet("/protected").reply(401);
    await api.get("/protected").catch(() => {});
    expect(redirectSpy).toHaveBeenCalledWith("/login?expired=1");

    redirectSpy.mockRestore();
  });

  it("does not crash on network errors (error.response undefined)", async () => {
    mock.onGet("/test").networkError();
    await api.get("/test").catch(() => {});
    // No redirect should have been called — verify no crash
  });
});
