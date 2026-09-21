import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const REQUIRED_ENV = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  AUTH_SECRET: "a-sufficiently-random-secret",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("env", () => {
  it("loads successfully when all required variables are present and valid", async () => {
    Object.assign(process.env, REQUIRED_ENV);
    const { env } = await import("@/lib/env");
    expect(env.DATABASE_URL).toBe(REQUIRED_ENV.DATABASE_URL);
    expect(env.NEXT_PUBLIC_APP_URL).toBe(REQUIRED_ENV.NEXT_PUBLIC_APP_URL);
  });

  it("throws a clear error when a required variable is missing", async () => {
    Object.assign(process.env, REQUIRED_ENV);
    delete process.env.DATABASE_URL;

    await expect(import("@/lib/env")).rejects.toThrow(/Invalid environment variables/);
  });

  it("throws when NEXT_PUBLIC_APP_URL is not a valid URL", async () => {
    Object.assign(process.env, REQUIRED_ENV, { NEXT_PUBLIC_APP_URL: "not-a-url" });

    await expect(import("@/lib/env")).rejects.toThrow(/Invalid environment variables/);
  });

  it("leaves optional integrations undefined when unset instead of failing", async () => {
    Object.assign(process.env, REQUIRED_ENV);
    delete process.env.LEMONSQUEEZY_API_KEY;

    const { env } = await import("@/lib/env");
    expect(env.LEMONSQUEEZY_API_KEY).toBeUndefined();
  });
});
