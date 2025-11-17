import { tokenService } from "../src/services/tokenService";

describe("TokenService", () => {
  beforeEach(() => {
    tokenService["tokens"].clear();
  });

  test("should store and retrieve token", () => {
    const tokenData = {
      userId: "test123",
      broker: "mock",
      accessToken: "token123",
      refreshToken: "refresh123",
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };

    tokenService.setToken(tokenData);
    const retrieved = tokenService.getToken("test123", "mock");

    expect(retrieved).toEqual(tokenData);
  });

  test("should return null for non-existent token", () => {
    const result = tokenService.getToken("nonexistent", "mock");
    expect(result).toBeNull();
  });

  test("should delete token", () => {
    const tokenData = {
      userId: "test123",
      broker: "mock",
      accessToken: "token123",
      refreshToken: "refresh123",
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };

    tokenService.setToken(tokenData);
    const deleted = tokenService.deleteToken("test123", "mock");

    expect(deleted).toBe(true);
    expect(tokenService.getToken("test123", "mock")).toBeNull();
  });

  test("should check if token exists", () => {
    const tokenData = {
      userId: "test123",
      broker: "mock",
      accessToken: "token123",
      refreshToken: "refresh123",
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };

    tokenService.setToken(tokenData);

    expect(tokenService.hasToken("test123", "mock")).toBe(true);
    expect(tokenService.hasToken("nonexistent", "mock")).toBe(false);
  });
});
