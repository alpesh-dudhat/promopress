"use client";

import { useRef, useState } from "react";
import { createMockup, listProductsForMockupBuilder } from "@/features/mockups/actions";
import type { DecorationType } from "@/features/products/types";

type Catalog = Awaited<ReturnType<typeof listProductsForMockupBuilder>>;
type CatalogProduct = Catalog[number];
type CatalogColor = CatalogProduct["colors"][number];
type CatalogView = CatalogColor["views"][number];
type CatalogZone = CatalogView["zones"][number];

export function MockupBuilder({ catalog }: { catalog: Catalog }) {
  const [productId, setProductId] = useState(catalog[0]?.id ?? "");
  const product = catalog.find((p) => p.id === productId);

  const [colorId, setColorId] = useState(product?.colors[0]?.id ?? "");
  const color = product?.colors.find((c: CatalogColor) => c.id === colorId) ?? product?.colors[0];

  const [viewId, setViewId] = useState(color?.views[0]?.id ?? "");
  const view = color?.views.find((v: CatalogView) => v.id === viewId) ?? color?.views[0];

  const [zoneId, setZoneId] = useState(view?.zones[0]?.id ?? "");
  const zone = view?.zones.find((z: CatalogZone) => z.id === zoneId) ?? view?.zones[0];

  const decorationOptions = zone ? (zone.decorationTypes.split(",") as DecorationType[]) : [];

  // Logo placement, expressed relative to the zone (0-100 = zone's own bounds).
  const [posXPct, setPosXPct] = useState(25);
  const [posYPct, setPosYPct] = useState(25);
  const [widthPct, setWidthPct] = useState(50);
  const [logoAspect, setLogoAspect] = useState(1); // naturalWidth / naturalHeight
  const [imageAspect, setImageAspect] = useState(1);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // The logo's height-as-%-of-zone-height, derived (not stored) so it always
  // reflects the logo's true aspect ratio regardless of the zone's own shape.
  const heightPct = zone
    ? widthPct * (zone.widthPct / zone.heightPct) * imageAspect / logoAspect
    : 0;

  function clamp(value: number, max: number) {
    return Math.min(Math.max(value, 0), Math.max(max, 0));
  }

  function handleProductChange(id: string) {
    setProductId(id);
    const p = catalog.find((c) => c.id === id);
    setColorId(p?.colors[0]?.id ?? "");
    setViewId(p?.colors[0]?.views[0]?.id ?? "");
    setZoneId(p?.colors[0]?.views[0]?.zones[0]?.id ?? "");
  }

  function handleColorChange(id: string) {
    setColorId(id);
    const c = product?.colors.find((col: CatalogColor) => col.id === id);
    setViewId(c?.views[0]?.id ?? "");
    setZoneId(c?.views[0]?.zones[0]?.id ?? "");
  }

  function handleViewChange(id: string) {
    setViewId(id);
    const v = color?.views.find((vw: CatalogView) => vw.id === id);
    setZoneId(v?.zones[0]?.id ?? "");
  }

  function handleLogoFile(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreviewUrl(url);
    const img = new Image();
    img.onload = () => setLogoAspect(img.naturalWidth / img.naturalHeight || 1);
    img.src = url;
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setImageAspect(img.naturalWidth / img.naturalHeight || 1);
  }

  function onLogoMouseDown(e: React.MouseEvent, containerEl: HTMLDivElement) {
    e.preventDefault();
    if (!zone) return;
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = posXPct;
    const startY = posYPct;
    setDragging(true);

    function onMove(ev: MouseEvent) {
      const rect = containerEl.getBoundingClientRect();
      const zoneWidthPx = rect.width * (zone!.widthPct / 100);
      const zoneHeightPx = rect.height * (zone!.heightPct / 100);
      const deltaXPct = ((ev.clientX - startClientX) / zoneWidthPx) * 100;
      const deltaYPct = ((ev.clientY - startClientY) / zoneHeightPx) * 100;
      setPosXPct(clamp(startX + deltaXPct, 100 - widthPct));
      setPosYPct(clamp(startY + deltaYPct, 100 - heightPct));
    }
    function onUp() {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleWidthChange(value: number) {
    const newHeightPct = zone
      ? value * (zone.widthPct / zone.heightPct) * imageAspect / logoAspect
      : 0;
    setWidthPct(value);
    setPosXPct((x) => clamp(x, 100 - value));
    setPosYPct((y) => clamp(y, 100 - newHeightPct));
  }

  if (!product || !color || !view || !zone) {
    return (
      <p className="text-sm text-zinc-500">
        No products with print zones yet — set one up in the admin product catalog first.
      </p>
    );
  }

  return (
    <form action={createMockup} className="flex flex-col gap-6 md:flex-row">
      <div className="flex w-full flex-col gap-3 md:w-64">
        <label className="flex flex-col gap-1 text-sm">
          Sales order ref
          <input name="salesOrderRef" required className="rounded border px-2 py-1" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Product
          <select
            value={productId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="rounded border px-2 py-1"
          >
            {catalog.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Color
          <select
            value={colorId}
            onChange={(e) => handleColorChange(e.target.value)}
            className="rounded border px-2 py-1"
          >
            {product.colors.map((c: CatalogColor) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          View
          <select
            value={viewId}
            onChange={(e) => handleViewChange(e.target.value)}
            className="rounded border px-2 py-1"
          >
            {color.views.map((v: CatalogView) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Print zone
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="rounded border px-2 py-1"
          >
            {view.zones.map((z: CatalogZone) => (
              <option key={z.id} value={z.id}>
                {z.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Decoration type
          <select name="decorationType" className="rounded border px-2 py-1">
            {decorationOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Logo file
          <input
            type="file"
            name="logo"
            accept="image/*"
            required
            onChange={(e) => handleLogoFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Logo size ({Math.round(widthPct)}% of zone width)
          <input
            type="range"
            min={5}
            max={100}
            value={widthPct}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
          />
        </label>

        <p className="text-xs text-zinc-500">
          Zone max: {zone.maxWidthCm}cm x {zone.maxHeightCm}cm. Logo here:{" "}
          {((widthPct / 100) * zone.maxWidthCm).toFixed(1)}cm x{" "}
          {((heightPct / 100) * zone.maxHeightCm).toFixed(1)}cm.
        </p>

        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="productColorId" value={colorId} />
        <input type="hidden" name="productViewId" value={viewId} />
        <input type="hidden" name="zoneId" value={zoneId} />
        <input type="hidden" name="xPct" value={posXPct} />
        <input type="hidden" name="yPct" value={posYPct} />
        <input type="hidden" name="widthPct" value={widthPct} />
        <input type="hidden" name="heightPct" value={heightPct} />

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Save mockup
        </button>
      </div>

      <ZoneCanvas
        imageUrl={view.imageUrl}
        zone={zone}
        onImageLoad={onImageLoad}
        logoPreviewUrl={logoPreviewUrl}
        posXPct={posXPct}
        posYPct={posYPct}
        widthPct={widthPct}
        heightPct={heightPct}
        onLogoMouseDown={onLogoMouseDown}
        dragging={dragging}
      />
    </form>
  );
}

function ZoneCanvas({
  imageUrl,
  zone,
  onImageLoad,
  logoPreviewUrl,
  posXPct,
  posYPct,
  widthPct,
  heightPct,
  onLogoMouseDown,
  dragging,
}: {
  imageUrl: string;
  zone: CatalogZone;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  logoPreviewUrl: string | null;
  posXPct: number;
  posYPct: number;
  widthPct: number;
  heightPct: number;
  onLogoMouseDown: (e: React.MouseEvent, container: HTMLDivElement) => void;
  dragging: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const absXPct = zone.xPct + (posXPct / 100) * zone.widthPct;
  const absYPct = zone.yPct + (posYPct / 100) * zone.heightPct;
  const absWidthPct = (widthPct / 100) * zone.widthPct;
  const absHeightPct = (heightPct / 100) * zone.heightPct;

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-md select-none border md:w-96 ${dragging ? "cursor-grabbing" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- size is dictated by the container, not known up front */}
      <img src={imageUrl} alt="Product view" className="block w-full" draggable={false} onLoad={onImageLoad} />

      <div
        className="pointer-events-none absolute border-2 border-blue-500/60"
        style={{
          left: `${zone.xPct}%`,
          top: `${zone.yPct}%`,
          width: `${zone.widthPct}%`,
          height: `${zone.heightPct}%`,
        }}
      />

      {logoPreviewUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- preview-only object URL, not an optimizable asset
        <img
          src={logoPreviewUrl}
          alt="Logo placement"
          draggable={false}
          onMouseDown={(e) => containerRef.current && onLogoMouseDown(e, containerRef.current)}
          className="absolute cursor-grab"
          style={{
            left: `${absXPct}%`,
            top: `${absYPct}%`,
            width: `${absWidthPct}%`,
            height: `${absHeightPct}%`,
          }}
        />
      )}
    </div>
  );
}
