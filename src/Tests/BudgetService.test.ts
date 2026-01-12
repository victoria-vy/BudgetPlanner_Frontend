import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";
import type { Budget } from "@/models/Budget";

import {
  getBudgets,
  createBudget,
} from "@/service/budgetService";


vi.mock("@/service/authService", () => ({
  authHeader: () => ({ Authorization: "Bearer test-token" }),
}));


const mockFetch = vi.fn() as Mock;
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("budgetService", () => {

  it("ruft GET /api/budgets auf", async () => {
    const mockBudgets: Budget[] = [
      {
        id: 1,
        month: "2026-01",
        limitAmount: 800,
        category: "FOOD",
      },
      {
        id: 2,
        month: "2026-01",
        limitAmount: 1200,
        category: "RENT",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockBudgets,
    } as Response);

    const result = await getBudgets();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/budgets"),
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" },
      })
    );

    expect(result).toEqual(mockBudgets);
  });

  it("sendet POST /api/budgets mit Body und gibt Budget zurück", async () => {
    const budget: Budget = {
      month: "2026-02",
      limitAmount: 300,
      category: "FUN",
    };

    const savedBudget: Budget = {
      id: 3,
      ...budget,
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => savedBudget,
    } as Response);

    const result = await createBudget(budget);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/budgets"),
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(budget),
      })
    );

    expect(result).toEqual(savedBudget);
  });

});
