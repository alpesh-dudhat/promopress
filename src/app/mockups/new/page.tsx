import { listProductsForMockupBuilder } from "@/features/mockups/actions";
import { MockupBuilder } from "@/features/mockups/components/MockupBuilder";

// Reads live database state — must not be statically prerendered.
export const dynamic = "force-dynamic";

export default async function NewMockupPage() {
  const catalog = await listProductsForMockupBuilder();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">New mockup</h1>
      <div className="mt-6">
        <MockupBuilder catalog={catalog} />
      </div>
    </main>
  );
}
