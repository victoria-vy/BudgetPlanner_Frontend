import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";
import type { Income } from "@/models/Income";

import {
  getIncome,
  createIncome,
  deleteIncome
} from "@/service/incomeService";

vi.mock("@/service/authService", () => ({
  authHeader: () => ({ Authorization: "Bearer test-token" }),
}));


const mockFetch = vi.fn() as Mock;
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("incomeService", () => {

  it("ruft GET /api/income auf und gibt Daten zurück", async () => {
    const mockData: Income[] = [
      { id: 1, title: "Gehalt", amount: 2000, category: "SALARY", date: "2026-01-01" }
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await getIncome();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/income"),
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" }
      })
    );

    expect(result).toEqual(mockData);
  });

  it("sendet POST /api/income mit Body und gibt Income zurück", async () => {
    const income: Income = {
      id: 0,
      title: "Bonus",
      amount: 500,
      category: "GIFT",
      date: "2026-01-10",
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => income,
    } as Response);

    const result = await createIncome(income);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/income"),
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(income),
      })
    );

    expect(result).toEqual(income);
  });

  it(" ruft DELETE /api/income/{id} auf", async () => {
    mockFetch.mockResolvedValue({ ok: true } as Response);

    await deleteIncome(5);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/income/5"),
      expect.objectContaining({
        method: "DELETE",
        headers: { Authorization: "Bearer test-token" },
      })
    );
  });

});
