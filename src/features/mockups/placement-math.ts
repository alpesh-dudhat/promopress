// Pure geometry for placing a logo within a print zone. Kept free of React
// and DOM so it can be unit tested directly, and shared between the
// interactive builder and the read-only preview so they can never drift.

export interface ZoneRect {
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
}

export function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, 0), Math.max(max, 0));
}

/**
 * Given a logo's width as a percentage of the zone's width, returns the
 * matching height as a percentage of the zone's height — preserving the
 * logo's true visual aspect ratio regardless of the zone's own shape or
 * the product image's aspect ratio.
 *
 * Derivation: a rendered pixel width of `widthPct% * zoneBoxPx.width`
 * implies a pixel height of that divided by the logo's aspect ratio.
 * zoneBoxPx.width / zoneBoxPx.height is itself
 * (zone.widthPct / zone.heightPct) * imageAspect, since the zone box is a
 * percentage crop of the rendered product image.
 */
export function logoHeightPct(
  widthPct: number,
  zone: Pick<ZoneRect, "widthPct" | "heightPct">,
  imageAspect: number,
  logoAspect: number
): number {
  if (logoAspect <= 0) return 0;
  return (widthPct * (zone.widthPct / zone.heightPct) * imageAspect) / logoAspect;
}

/**
 * Converts a placement's position/size — stored relative to its zone
 * (0-100 = the zone's own bounds) — into position/size relative to the
 * full product image, for absolute CSS positioning.
 */
export function absolutePlacementRect(
  placement: { xPct: number; yPct: number; widthPct: number; heightPct: number },
  zone: ZoneRect
): { xPct: number; yPct: number; widthPct: number; heightPct: number } {
  return {
    xPct: zone.xPct + (placement.xPct / 100) * zone.widthPct,
    yPct: zone.yPct + (placement.yPct / 100) * zone.heightPct,
    widthPct: (placement.widthPct / 100) * zone.widthPct,
    heightPct: (placement.heightPct / 100) * zone.heightPct,
  };
}
