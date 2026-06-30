// Read-only composite render: a product view with its saved logo
// placement(s) drawn on top, using the same % positioning convention as
// the interactive builder (zone is relative to image, placement is
// relative to zone).

export function MockupPreview({
  imageUrl,
  placements,
}: {
  imageUrl: string;
  placements: {
    logoUrl: string;
    xPct: number;
    yPct: number;
    widthPct: number;
    heightPct: number;
    zone: { xPct: number; yPct: number; widthPct: number; heightPct: number };
  }[];
}) {
  return (
    <div className="relative w-full max-w-md border md:w-96">
      {/* eslint-disable-next-line @next/next/no-img-element -- size is dictated by the container, not known up front */}
      <img src={imageUrl} alt="Mockup preview" className="block w-full" />
      {placements.map((p, i) => {
        const absXPct = p.zone.xPct + (p.xPct / 100) * p.zone.widthPct;
        const absYPct = p.zone.yPct + (p.yPct / 100) * p.zone.heightPct;
        const absWidthPct = (p.widthPct / 100) * p.zone.widthPct;
        const absHeightPct = (p.heightPct / 100) * p.zone.heightPct;
        return (
          // eslint-disable-next-line @next/next/no-img-element -- composited at an arbitrary runtime position/size
          <img
            key={i}
            src={p.logoUrl}
            alt="Logo"
            className="absolute"
            style={{
              left: `${absXPct}%`,
              top: `${absYPct}%`,
              width: `${absWidthPct}%`,
              height: `${absHeightPct}%`,
            }}
          />
        );
      })}
    </div>
  );
}
