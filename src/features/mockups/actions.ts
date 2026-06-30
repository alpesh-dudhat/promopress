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
      productView: true,
      placements: { include: { zone: true } },
    },
  });
}

export async function createMockup(formData: FormData) {
  const user = await requireUser();
  const salesOrderRef = String(formData.get("salesOrderRef") ?? "").trim();
  const productId = String(formData.get("productId") ?? "");
  const productColorId = String(formData.get("productColorId") ?? "");
  const productViewId = String(formData.get("productViewId") ?? "");
  const zoneId = String(formData.get("zoneId") ?? "");
  const decorationType = String(formData.get("decorationType") ?? "");
  const logo = formData.get("logo") as File | null;

  const xPct = Number(formData.get("xPct"));
  const yPct = Number(formData.get("yPct"));
  const widthPct = Number(formData.get("widthPct"));
  const heightPct = Number(formData.get("heightPct"));

  if (
    !salesOrderRef ||
    !productId ||
    !productColorId ||
    !productViewId ||
    !zoneId ||
    !decorationType ||
    !logo ||
    logo.size === 0 ||
    [xPct, yPct, widthPct, heightPct].some(Number.isNaN)
  ) {
    throw new Error("All fields, including a logo file, are required.");
  }

  const zone = await db.printZone.findUnique({ where: { id: zoneId } });
  if (!zone || !zone.decorationTypes.split(",").includes(decorationType)) {
    throw new Error("Selected decoration type isn't allowed for this print zone.");
  }

  const logoUrl = await saveLogo(logo);

  const mockup = await db.mockup.create({
    data: {
      salesOrderRef,
      productId,
      productColorId,
      productViewId,
      createdById: user.id,
      placements: {
        create: {
          zoneId,
          logoUrl,
          decorationType,
          xPct,
          yPct,
          widthPct,
          heightPct,
        },
      },
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
