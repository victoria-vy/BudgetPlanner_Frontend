import { describe, it, expect, beforeEach } from "vitest";
import {
  setToken,
  getToken,
  authHeader,
  isLoggedIn
} from "@/service/authService";

describe("authService", () => {

  beforeEach(() => {

    sessionStorage.clear();
  });

  it("speichert und liest ein Token korrekt", () => {
    setToken("test-token-123");

    const token = getToken();
    expect(token).toBe("test-token-123");

    expect(isLoggedIn()).toBe(true);
  });

  it("wirft Fehler bei authHeader(), wenn kein Token vorhanden ist", () => {
    expect(() => authHeader()).toThrow("Nicht eingeloggt");
    expect(isLoggedIn()).toBe(false);
  });

});
