"use client";

import { useRef, useState } from "react";
import { addPrintZone, deletePrintZone } from "@/features/products/actions";
import type { DecorationType, PrintZone } from "@/features/products/types";

interface DraftRect {
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
}

const DECORATION_OPTIONS: DecorationType[] = ["PRINT", "EMBROIDERY"];

export function ZoneEditor({
  productId,
  productViewId,
  imageUrl,
  zones,
}: {
  productId: string;
  productViewId: string;
  imageUrl: string;
  zones: PrintZone[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState<DraftRect | null>(null);

  function pctFromEvent(e: React.MouseEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.min(Math.max(x, 0), 100),
      y: Math.min(Math.max(y, 0), 100),
    };
  }

  function onMouseDown(e: React.MouseEvent) {
    const { x, y } = pctFromEvent(e);
    setDragStart({ x, y });
    setDraft({ xPct: x, yPct: y, widthPct: 0, heightPct: 0 });
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragStart) return;
    const { x, y } = pctFromEvent(e);
    setDraft({
      xPct: Math.min(dragStart.x, x),
      yPct: Math.min(dragStart.y, y),
      widthPct: Math.abs(x - dragStart.x),
      heightPct: Math.abs(y - dragStart.y),
    });
  }

  function onMouseUp() {
    setDragStart(null);
    if (draft && (draft.widthPct < 1 || draft.heightPct < 1)) {
      // Treat a near-zero drag as a misclick, not an intentional zone.
      setDraft(null);
    }
  }

  function cancelDraft() {
    setDraft(null);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div
        ref={containerRef}
        className="relative w-full max-w-md select-none border md:w-96"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- size is dictated by the container, not known up front */}
        <img src={imageUrl} alt="Product view" className="block w-full" draggable={false} />

        {zones.map((zone) => (
          <div
            key={zone.id}
            className="absolute border-2 border-blue-500 bg-blue-500/10"
            style={{
              left: `${zone.xPct}%`,
              top: `${zone.yPct}%`,
              width: `${zone.widthPct}%`,
              height: `${zone.heightPct}%`,
            }}
            title={zone.label}
          />
        ))}

        {draft && (
          <div
            className="absolute border-2 border-dashed border-green-600 bg-green-500/10"
            style={{
              left: `${draft.xPct}%`,
              top: `${draft.yPct}%`,
              width: `${draft.widthPct}%`,
              height: `${draft.heightPct}%`,
            }}
          />
        )}
      </div>

      <div className="flex w-full flex-col gap-4 md:w-64">
        {draft && draft.widthPct >= 1 && draft.heightPct >= 1 ? (
          <form
            action={addPrintZone}
            onSubmit={() => setDraft(null)}
            className="flex flex-col gap-2 rounded border p-3"
          >
            <h3 className="text-sm font-medium">New zone</h3>
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="productViewId" value={productViewId} />
            <input type="hidden" name="xPct" value={draft.xPct} />
            <input type="hidden" name="yPct" value={draft.yPct} />
            <input type="hidden" name="widthPct" value={draft.widthPct} />
            <input type="hidden" name="heightPct" value={draft.heightPct} />

            <input
              name="label"
              placeholder="Label (e.g. Left Chest)"
              required
              className="rounded border px-2 py-1 text-sm"
            />

            <fieldset className="flex gap-3 text-sm">
              {DECORATION_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-1">
                  <input type="checkbox" name="decorationTypes" value={opt} />
                  {opt}
                </label>
              ))}
            </fieldset>

            <div className="flex gap-2">
              <input
                name="maxWidthCm"
                type="number"
                step="0.1"
                placeholder="Max width (cm)"
                required
                className="w-full rounded border px-2 py-1 text-sm"
              />
              <input
                name="maxHeightCm"
                type="number"
                step="0.1"
                placeholder="Max height (cm)"
                required
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="rounded bg-black px-3 py-1 text-sm text-white">
                Save zone
              </button>
              <button
                type="button"
                onClick={cancelDraft}
                className="rounded border px-3 py-1 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-zinc-500">
            Click and drag on the image to draw a new print zone.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Existing zones</h3>
          {zones.length === 0 && (
            <p className="text-sm text-zinc-500">No zones yet.</p>
          )}
          {zones.map((zone) => (
            <div key={zone.id} className="flex items-center justify-between rounded border p-2 text-sm">
              <div>
                <div className="font-medium">{zone.label}</div>
                <div className="text-xs text-zinc-500">
                  {zone.decorationTypes.join(", ")} · max {zone.maxWidthCm}x{zone.maxHeightCm}cm
                </div>
              </div>
              <form action={deletePrintZone.bind(null, zone.id, productId, productViewId)}>
                <button type="submit" className="text-xs text-red-600">
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
