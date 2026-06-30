import Link from "next/link";
import { listMockups } from "@/features/mockups/actions";

// Reads live database state — must not be statically prerendered.
export const dynamic = "force-dynamic";

export default async function MockupsPage() {
  const mockups = await listMockups();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mockups</h1>
        <Link href="/mockups/new" className="rounded bg-black px-4 py-2 text-sm text-white">
          New mockup
        </Link>
      </div>

      <ul className="mt-6 flex flex-col gap-2">
        {mockups.map((m) => (
          <li key={m.id}>
            <Link href={`/mockups/${m.id}`} className="block rounded border p-4 hover:bg-zinc-50">
              <div className="font-medium">{m.salesOrderRef}</div>
              <div className="text-sm text-zinc-600">
                {m.product.name} · {m.productColor.name} · {m.status}
              </div>
            </Link>
          </li>
        ))}
        {mockups.length === 0 && (
          <li className="text-sm text-zinc-500">No mockups yet — create one above.</li>
        )}
      </ul>
    </main>
  );
}
