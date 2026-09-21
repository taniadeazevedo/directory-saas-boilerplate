import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 3, 60_000).success).toBe(true);
    expect(rateLimit(key, 3, 60_000).success).toBe(true);
    expect(rateLimit(key, 3, 60_000).success).toBe(true);
  });

  it("blocks requests once the limit is exceeded", () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const third = rateLimit(key, 2, 60_000);
    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets after the window expires", async () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 1, 10);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(rateLimit(key, 1, 10).success).toBe(true);
  });
});
