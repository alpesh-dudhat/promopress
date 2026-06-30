"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { MockupStatus } from "@/features/mockups/types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "logos");

async function saveLogo(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".png";
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/logos/${filename}`;
}

export async function listProductsForMockupBuilder() {
  return db.product.findMany({
    include: {
      colors: {
        include: {
          views: {
            include: { zones: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function listMockups() {
  return db.mockup.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true, productColor: true },
  });
}

export async function getMockup(id: string) {
  return db.mockup.findUnique({
    where: { id },
    include: {
      product: true,
      productColor: true,
      placements: { include: { zone: { include: { productView: true } } } },
    },
  });
}

interface PlacementInput {
  zoneId: string;
  decorationType: string;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
}

function parsePlacementsMeta(raw: string): PlacementInput[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Malformed placements data.");
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("At least one logo placement is required.");
  }
  return parsed.map((p) => {
    if (
      typeof p !== "object" ||
      p === null ||
      typeof (p as PlacementInput).zoneId !== "string" ||
      typeof (p as PlacementInput).decorationType !== "string" ||
      [
        (p as PlacementInput).xPct,
        (p as PlacementInput).yPct,
        (p as PlacementInput).widthPct,
        (p as PlacementInput).heightPct,
      ].some((n) => typeof n !== "number" || Number.isNaN(n))
    ) {
      throw new Error("Malformed placement entry.");
    }
    return p as PlacementInput;
  });
}

export async function createMockup(formData: FormData) {
  const user = await requireUser();
  const salesOrderRef = String(formData.get("salesOrderRef") ?? "").trim();
  const productId = String(formData.get("productId") ?? "");
  const productColorId = String(formData.get("productColorId") ?? "");
  const placementsMetaRaw = String(formData.get("placementsMeta") ?? "");

  if (!salesOrderRef || !productId || !productColorId || !placementsMetaRaw) {
    throw new Error("Sales order ref, product, color, and at least one placement are required.");
  }

  const placementsInput = parsePlacementsMeta(placementsMetaRaw);

  // Validate every zone exists, belongs to this product/color, and allows
  // the chosen decoration type — and collect the matching logo file.
  const placementsData: {
    zoneId: string;
    logoUrl: string;
    decorationType: string;
    xPct: number;
    yPct: number;
    widthPct: number;
    heightPct: number;
  }[] = [];

  for (let i = 0; i < placementsInput.length; i++) {
    const p = placementsInput[i];
    const logo = formData.get(`logo_${i}`) as File | null;
    if (!logo || logo.size === 0) {
      throw new Error(`Missing logo file for placement ${i + 1}.`);
    }

    const zone = await db.printZone.findUnique({
      where: { id: p.zoneId },
      include: { productView: true },
    });
    if (!zone || zone.productView.productColorId !== productColorId) {
      throw new Error("A selected print zone doesn't belong to this product/color.");
    }
    if (!zone.decorationTypes.split(",").includes(p.decorationType)) {
      throw new Error("Selected decoration type isn't allowed for one of the chosen print zones.");
    }

    const logoUrl = await saveLogo(logo);
    placementsData.push({
      zoneId: p.zoneId,
      logoUrl,
      decorationType: p.decorationType,
      xPct: p.xPct,
      yPct: p.yPct,
      widthPct: p.widthPct,
      heightPct: p.heightPct,
    });
  }

  const mockup = await db.mockup.create({
    data: {
      salesOrderRef,
      productId,
      productColorId,
      createdById: user.id,
      placements: { create: placementsData },
    },
  });

  revalidatePath("/mockups");
  redirect(`/mockups/${mockup.id}`);
}

export async function setMockupStatus(id: string, status: MockupStatus) {
  await requireUser();
  await db.mockup.update({ where: { id }, data: { status } });
  revalidatePath(`/mockups/${id}`);
  revalidatePath("/mockups");
}
