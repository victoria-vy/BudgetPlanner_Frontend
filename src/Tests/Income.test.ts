import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Income from "@/views/Income.vue";
import * as incomeService from "@/service/incomeService";
import flushPromises from "flush-promises";

beforeEach(() => {
  vi.restoreAllMocks();

  vi.spyOn(incomeService, "getIncome").mockResolvedValue([
    { id: 1, title: "Gehalt", amount: 2000, category: "SALARY", date: "2026-01-01" },
    { id: 2, title: "Nebenjob", amount: 150, category: "SIDE", date: "2026-01-02" },
  ]);

  vi.spyOn(incomeService, "createIncome").mockImplementation(async (item) => ({
    id: Math.floor(Math.random() * 1000),
    ...item,
    date: "2026-01-10",
  }));

  vi.spyOn(incomeService, "deleteIncome").mockResolvedValue(undefined);
});

describe("Income.vue", () => {
  it("lädt vorhandene Items beim Mount", async () => {
    const wrapper = mount(Income);
    await flushPromises(); // wartet auf getIncome()

    const items = wrapper.findAll(".item-card");
    expect(items.length).toBe(2);
    expect(items[0].text()).toContain("Gehalt");
    expect(items[1].text()).toContain("Nebenjob");
  });

  it("fügt einen neuen Income-Eintrag hinzu", async () => {
    const wrapper = mount(Income);
    await flushPromises(); // wartet auf getIncome()

    await wrapper.find('input[placeholder="Titel (z.B. Gehalt)"]').setValue("Test Income");
    await wrapper.find('input[placeholder="Betrag (€)"]').setValue("123.45");
    await wrapper.find('select').setValue("GIFT");

    await wrapper.find('[data-testid="add-income"]').trigger("click");
    await flushPromises(); // wartet auf createIncome

    const items = wrapper.findAll(".item-card");
    expect(items.length).toBe(3);
    expect(items[0].text()).toContain("Test Income");
    expect(items[0].text()).toContain("123.45");
    expect(items[0].text()).toContain("GIFT");
  });

  it("löscht einen Income-Eintrag", async () => {
    const wrapper = mount(Income);
    await flushPromises(); // wartet auf getIncome()

    const deleteButtons = wrapper.findAll('[data-testid="delete-income"]');
    await deleteButtons[0].trigger("click");
    await flushPromises(); // wartet auf deleteIncome

    const items = wrapper.findAll(".item-card");
    expect(items.length).toBe(1);
    expect(items[0].text()).toContain("Nebenjob");
  });
});
