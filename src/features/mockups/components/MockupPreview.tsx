// Read-only composite render: groups placements by the view they belong
// to (front/back/etc, derived from each placement's zone) and renders one
// product image per view with its logo placement(s) drawn on top.

interface Placement {
  logoUrl: string;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  zone: {
    xPct: number;
    yPct: number;
    widthPct: number;
    heightPct: number;
    productView: { id: string; name: string; imageUrl: string };
  };
}

export function MockupPreview({ placements }: { placements: Placement[] }) {
  const byView = new Map<string, { name: string; imageUrl: string; items: Placement[] }>();
  for (const p of placements) {
    const v = p.zone.productView;
    if (!byView.has(v.id)) {
      byView.set(v.id, { name: v.name, imageUrl: v.imageUrl, items: [] });
    }
    byView.get(v.id)!.items.push(p);
  }

  return (
    <div className="flex flex-wrap gap-4">
      {[...byView.entries()].map(([viewId, { name, imageUrl, items }]) => (
        <div key={viewId} className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">{name}</span>
          <div className="relative w-64 border">
            {/* eslint-disable-next-line @next/next/no-img-element -- size is dictated by the container, not known up front */}
            <img src={imageUrl} alt={`Mockup preview — ${name}`} className="block w-full" />
            {items.map((p, i) => {
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
        </div>
      ))}
    </div>
  );
}
