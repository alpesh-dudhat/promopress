import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { addProductColor, addProductView, getProductDetail } from "@/features/products/actions";

const VIEW_NAMES = ["front", "back", "left-sleeve", "right-sleeve"] as const;

// Reads live database state — must not be statically prerendered.
export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProductDetail(productId);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/admin/products" className="text-sm text-zinc-500">
        &larr; All products
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{product.name}</h1>
      <p className="text-zinc-600">{product.category}</p>

      <form
        action={addProductColor}
        className="mt-6 flex flex-col gap-3 rounded border p-4"
      >
        <h2 className="font-medium">Add color</h2>
        <input type="hidden" name="productId" value={product.id} />
        <input name="name" placeholder="Color name (e.g. Navy)" required className="rounded border px-3 py-2" />
        <input
          name="hex"
          type="color"
          defaultValue="#1f2937"
          required
          className="h-10 w-20 rounded border"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white w-fit">
          Add color
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-6">
        {product.colors.map((color) => (
          <section key={color.id} className="rounded border p-4">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded-full border"
                style={{ backgroundColor: color.hex }}
              />
              <h3 className="font-medium">{color.name}</h3>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              {color.views.map((view) => (
                <Link
                  key={view.id}
                  href={`/admin/products/${product.id}/views/${view.id}`}
                  className="block w-32 rounded border p-2 text-center hover:bg-zinc-50"
                >
                  <Image
                    src={view.imageUrl}
                    alt={view.name}
                    width={112}
                    height={112}
                    className="mx-auto h-28 w-28 object-contain"
                  />
                  <div className="mt-1 text-xs">{view.name}</div>
                  <div className="text-xs text-zinc-500">{view.zones.length} zone(s)</div>
                </Link>
              ))}
            </div>

            <form action={addProductView} className="mt-4 flex flex-wrap items-center gap-2">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="productColorId" value={color.id} />
              <select name="name" required className="rounded border px-2 py-1 text-sm">
                {VIEW_NAMES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <input type="file" name="image" accept="image/*" required className="text-sm" />
              <button type="submit" className="rounded bg-black px-3 py-1 text-sm text-white">
                Add view
              </button>
            </form>
          </section>
        ))}
        {product.colors.length === 0 && (
          <p className="text-sm text-zinc-500">No colors yet — add one above.</p>
        )}
      </div>
    </main>
  );
}
