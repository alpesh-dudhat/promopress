import { describe, expect, it } from "vitest";
import { absolutePlacementRect, clamp, logoHeightPct } from "./placement-math";

describe("clamp", () => {
  it("passes values inside the range through unchanged", () => {
    expect(clamp(50, 100)).toBe(50);
  });

  it("floors negative values to 0", () => {
    expect(clamp(-10, 100)).toBe(0);
  });

  it("caps values above max", () => {
    expect(clamp(150, 100)).toBe(100);
  });

  it("treats a negative max as 0 rather than going negative", () => {
    expect(clamp(50, -10)).toBe(0);
  });
});

describe("logoHeightPct", () => {
  it("keeps a square logo square in a square zone on a square image", () => {
    const zone = { widthPct: 50, heightPct: 50 };
    expect(logoHeightPct(40, zone, 1, 1)).toBe(40);
  });

  it("compensates when the zone box is wider than tall (in rendered %)", () => {
    // Zone is 2x as wide as tall in % terms; to keep a square logo visually
    // square it needs proportionally more height-%.
    const zone = { widthPct: 80, heightPct: 40 };
    expect(logoHeightPct(50, zone, 1, 1)).toBe(100);
  });

  it("shrinks height-% for a logo that's visually wider than tall", () => {
    const zone = { widthPct: 50, heightPct: 50 };
    // logoAspect 2 = logo is twice as wide as it is tall.
    expect(logoHeightPct(50, zone, 1, 2)).toBe(25);
  });

  it("accounts for a non-square product image", () => {
    // Product image itself is 2:1 (landscape), so a zone that's square in
    // %-terms is actually 2:1 in real rendered pixels.
    const zone = { widthPct: 50, heightPct: 50 };
    expect(logoHeightPct(50, zone, 2, 1)).toBe(100);
  });

  it("returns 0 instead of dividing by zero for a degenerate logo aspect", () => {
    const zone = { widthPct: 50, heightPct: 50 };
    expect(logoHeightPct(50, zone, 1, 0)).toBe(0);
  });
});

describe("absolutePlacementRect", () => {
  it("converts a zone-relative placement into image-relative coordinates", () => {
    const zone = { xPct: 10, yPct: 20, widthPct: 30, heightPct: 40 };
    const placement = { xPct: 50, yPct: 25, widthPct: 60, heightPct: 20 };

    expect(absolutePlacementRect(placement, zone)).toEqual({
      xPct: 25,
      yPct: 30,
      widthPct: 18,
      heightPct: 8,
    });
  });

  it("returns the zone's own origin when the placement is at 0,0 full-size", () => {
    const zone = { xPct: 5, yPct: 5, widthPct: 20, heightPct: 20 };
    const placement = { xPct: 0, yPct: 0, widthPct: 100, heightPct: 100 };

    expect(absolutePlacementRect(placement, zone)).toEqual({
      xPct: 5,
      yPct: 5,
      widthPct: 20,
      heightPct: 20,
    });
  });
});
