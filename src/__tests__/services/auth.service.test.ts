import MockAdapter from "axios-mock-adapter";
import { api } from "../../services/api";
import { login } from "../../services/auth.service";

const mock = new MockAdapter(api);

beforeEach(() => mock.reset());
afterAll(() => mock.restore());

describe("login", () => {
  it("posts credentials to /auth/login and returns response data", async () => {
    const payload = { token: "abc123", user: { id: "u1", name: "Vet" } };
    mock.onPost("/auth/login").reply(200, payload);

    const result = await login({ email: "vet@clinic.com", password: "secret" });
    expect(result).toEqual(payload);
    expect(mock.history.post[0].url).toBe("/auth/login");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({
      email: "vet@clinic.com",
      password: "secret",
    });
  });

  it("propagates errors from the API", async () => {
    mock.onPost("/auth/login").reply(401, { message: "Invalid credentials" });
    await expect(login({ email: "x@x.com", password: "wrong" })).rejects.toThrow();
  });
});
