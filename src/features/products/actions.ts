"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

async function saveImage(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".png";
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/products/${filename}`;
}

export async function listProducts() {
  return db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { colors: true },
  });
}

export async function getProductDetail(productId: string) {
  return db.product.findUnique({
    where: { id: productId },
    include: {
      colors: {
        include: {
          views: {
            include: { zones: true },
          },
        },
      },
    },
  });
}

export async function getViewDetail(viewId: string) {
  return db.productView.findUnique({
    where: { id: viewId },
    include: { zones: true, productColor: { include: { product: true } } },
  });
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  if (!name || !category) {
    throw new Error("Product name and category are required.");
  }

  const product = await db.product.create({ data: { name, category } });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function addProductColor(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const hex = String(formData.get("hex") ?? "").trim();
  if (!productId || !name || !hex) {
    throw new Error("Color name and hex value are required.");
  }

  await db.productColor.create({ data: { productId, name, hex } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function addProductView(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const productColorId = String(formData.get("productColorId") ?? "");
  const name = String(formData.get("name") ?? "");
  const image = formData.get("image") as File | null;

  if (!productColorId || !name || !image || image.size === 0) {
    throw new Error("View name and a product image are required.");
  }

  const imageUrl = await saveImage(image);
  await db.productView.create({ data: { productColorId, name, imageUrl } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function addPrintZone(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const productViewId = String(formData.get("productViewId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const decorationTypes = formData.getAll("decorationTypes").map(String);

  const xPct = Number(formData.get("xPct"));
  const yPct = Number(formData.get("yPct"));
  const widthPct = Number(formData.get("widthPct"));
  const heightPct = Number(formData.get("heightPct"));
  const maxWidthCm = Number(formData.get("maxWidthCm"));
  const maxHeightCm = Number(formData.get("maxHeightCm"));

  if (
    !productViewId ||
    !label ||
    decorationTypes.length === 0 ||
    [xPct, yPct, widthPct, heightPct, maxWidthCm, maxHeightCm].some(Number.isNaN)
  ) {
    throw new Error("All zone fields are required, including at least one decoration type.");
  }

  await db.printZone.create({
    data: {
      productViewId,
      label,
      decorationTypes: decorationTypes.join(","),
      xPct,
      yPct,
      widthPct,
      heightPct,
      maxWidthCm,
      maxHeightCm,
    },
  });

  revalidatePath(`/admin/products/${productId}/views/${productViewId}`);
}

export async function deletePrintZone(zoneId: string, productId: string, productViewId: string) {
  await requireAdmin();
  await db.printZone.delete({ where: { id: zoneId } });
  revalidatePath(`/admin/products/${productId}/views/${productViewId}`);
}
