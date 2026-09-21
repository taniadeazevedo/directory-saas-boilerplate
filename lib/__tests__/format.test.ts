import { describe, expect, it } from "vitest";
import { formatCurrency, slugifyBase, truncate } from "@/lib/format";

describe("slugifyBase", () => {
  it("lowercases and hyphenates", () => {
    expect(slugifyBase("Hello World")).toBe("hello-world");
  });

  it("strips accents", () => {
    expect(slugifyBase("Café con Leche")).toBe("cafe-con-leche");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugifyBase("A!! B?? C")).toBe("a-b-c");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugifyBase("--Test--")).toBe("test");
  });
});

describe("truncate", () => {
  it("returns the original string when shorter than the limit", () => {
    expect(truncate("short", 10)).toBe("short");
  });

  it("truncates and appends an ellipsis when longer than the limit", () => {
    expect(truncate("a very long description", 10)).toBe("a very lon…");
  });
});

describe("formatCurrency", () => {
  it("formats a number as USD", () => {
    expect(formatCurrency(2900)).toContain("2,900");
    expect(formatCurrency(2900)).toContain("$");
  });
});
