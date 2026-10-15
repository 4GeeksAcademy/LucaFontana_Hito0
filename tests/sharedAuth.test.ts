import { clearStoredToken, createAuthApiClient, getStoredToken, setStoredToken } from "@shared/auth";

function makeResponse(status: number, payload?: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => payload,
  } as Response;
}

describe("shared auth token storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores, reads, and clears a browser token", () => {
    setStoredToken("token-value");

    expect(getStoredToken()).toBe("token-value");
    clearStoredToken();
    expect(getStoredToken()).toBeNull();
  });
});

describe("shared auth API client", () => {

  let fetchMock: jest.Mock;

  beforeEach(() => {
    window.localStorage.clear();
    fetchMock = jest.fn();
    Object.defineProperty(globalThis, "fetch", { value: fetchMock, writable: true, configurable: true });
  });

  it("attaches the stored bearer token to protected requests", async () => {
    setStoredToken("valid-token");
    fetchMock.mockResolvedValue(makeResponse(200, { id: 1 }));
    const client = createAuthApiClient("/api/", jest.fn());

    await client.getMe();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/me",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect((request.headers as Headers).get("Authorization")).toBe("Bearer valid-token");
  });

  it("clears expired sessions and notifies the redirect owner on 401", async () => {
    setStoredToken("expired-token");
    const onUnauthorized = jest.fn();
    fetchMock.mockResolvedValue(makeResponse(401));
    const client = createAuthApiClient("http://api.test", onUnauthorized);

    await expect(client.getMe()).rejects.toMatchObject({ name: "UnauthorizedError" });

    expect(getStoredToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("translates a failed login into the user-facing credential error", async () => {
    fetchMock.mockResolvedValue(makeResponse(401));
    const client = createAuthApiClient("http://api.test", jest.fn());

    await expect(client.login("user@example.com", "wrong-password")).rejects.toThrow(
      "Email o contraseña incorrectos",
    );
  });
});