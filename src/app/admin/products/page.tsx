import Link from "next/link";
import { createProduct, listProducts } from "@/features/products/actions";

// This page reads live, frequently-changing data from the database, so it
// must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Products</h1>

      <form action={createProduct} className="mt-6 flex flex-col gap-3 rounded border p-4">
        <h2 className="font-medium">New product</h2>
        <input
          name="name"
          placeholder="Product name (e.g. Classic Polo Shirt)"
          required
          className="rounded border px-3 py-2"
        />
        <input
          name="category"
          placeholder="Category (e.g. Polo Shirts)"
          required
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white w-fit">
          Create product
        </button>
      </form>

      <ul className="mt-8 flex flex-col gap-2">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/admin/products/${product.id}`}
              className="block rounded border p-4 hover:bg-zinc-50"
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-zinc-600">
                {product.category} · {product.colors.length} color
                {product.colors.length === 1 ? "" : "s"}
              </div>
            </Link>
          </li>
        ))}
        {products.length === 0 && (
          <li className="text-sm text-zinc-500">No products yet — create one above.</li>
        )}
      </ul>
    </main>
  );
}
