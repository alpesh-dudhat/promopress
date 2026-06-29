// Product catalog domain types.
// A Product is a garment style (e.g. "Classic Polo Shirt").
// Each Product has one or more colors, and each color has one or more views
// (front/back/sleeve) that a logo can be placed on.

export type DecorationType = "print" | "embroidery";

export interface PrintZone {
  id: string;
  label: string; // e.g. "Left Chest", "Full Back"
  decorationTypes: DecorationType[];
  // Position/size as a percentage of the product image, so zones
  // stay correctly placed regardless of rendered image resolution.
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  // Real-world max size in cm, shown on the spec sheet.
  maxWidthCm: number;
  maxHeightCm: number;
}

export interface ProductView {
  id: string;
  name: "front" | "back" | "left-sleeve" | "right-sleeve";
  imageUrl: string;
  zones: PrintZone[];
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  views: ProductView[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  colors: ProductColor[];
}
