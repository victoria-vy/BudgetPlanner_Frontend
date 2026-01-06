import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Account from "@/views/Account.vue";
import { nextTick } from "vue";

beforeEach(() => {
  vi.restoreAllMocks();

  global.fetch = vi.fn(() =>
    Promise.resolve({
      text: () => Promise.resolve("Erfolg"),
    } as Response)
  ) as any;

  global.alert = vi.fn();
});

describe("Account", () => {
  it("sendet Login-Daten korrekt", async () => {
    const wrapper = mount(Account);
    await nextTick();


    await wrapper.find('[data-testid="login-email"]').setValue("test@test.de");
    await wrapper
      .find('[data-testid="login-password"]')
      .setValue("123456");
    await wrapper.find('[data-testid="login-button"]').trigger("click");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@test.de",
          password: "123456",
        }),
      }
    );
  });

  it("sendet Signup-Daten korrekt", async () => {
    const wrapper = mount(Account);
    await nextTick();


    await wrapper
      .find('[data-testid="signup-name"]')
      .setValue("Max Mustermann");
    await wrapper
      .find('[data-testid="signup-email"]')
      .setValue("max@test.de");
    await wrapper
      .find('[data-testid="signup-password"]')
      .setValue("abcdef");
    await wrapper.find('[data-testid="signup-button"]').trigger("click");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Max Mustermann",
          email: "max@test.de",
          password: "abcdef",
        }),
      }
    );
  });
});
