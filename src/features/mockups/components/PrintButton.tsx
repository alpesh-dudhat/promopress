"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded border px-4 py-2 text-sm"
    >
      Print / Save as PDF
    </button>
  );
}
