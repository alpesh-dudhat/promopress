// Mockup domain types.
// A Mockup is one customer's logo placed onto one product/color/view,
// replacing the manually-built .cdr/PDF file in the old workflow.
//
// These string unions mirror exactly what's stored in the DB (see
// prisma/schema.prisma) since SQLite has no native enum type.

import type { DecorationType } from "@/features/products/types";

export type MockupStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export interface MockupPlacement {
  zoneId: string;
  logoUrl: string;
  decorationType: DecorationType;
  // Logo position/size within the zone, as a percentage of the zone's bounds.
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
}

export interface Mockup {
  id: string;
  salesOrderRef: string; // free-text Odoo sales order number for now
  productId: string;
  colorId: string;
  viewId: string;
  placements: MockupPlacement[];
  status: MockupStatus;
  createdBy: string;
  createdAt: string;
}
