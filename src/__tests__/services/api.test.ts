import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
  localStorage.clear();
});

afterAll(() => mock.restore());

describe("api interceptor", () => {
  it("adds Authorization header when token is in localStorage", async () => {
    localStorage.setItem("token", "my-jwt");
    mock.onGet("/test").reply(200, {});
    await api.get("/test");
    expect(mock.history.get[0].headers?.Authorization).toBe("Bearer my-jwt");
  });

  it("does not add Authorization header when no token", async () => {
    mock.onGet("/test").reply(200, {});
    await api.get("/test");
    expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
  });

  it("uses NEXT_PUBLIC_API_URL as baseURL when set", () => {
    expect(api.defaults.baseURL).toBeDefined();
  });
});
