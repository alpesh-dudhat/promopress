import Link from "next/link";
import { notFound } from "next/navigation";
import { getViewDetail } from "@/features/products/actions";
import { ZoneEditor } from "@/features/products/components/ZoneEditor";
import type { DecorationType } from "@/features/products/types";

export default async function ViewDetailPage({
  params,
}: {
  params: Promise<{ productId: string; viewId: string }>;
}) {
  const { productId, viewId } = await params;
  const view = await getViewDetail(viewId);
  if (!view) notFound();

  const zones = view.zones.map((zone) => ({
    ...zone,
    decorationTypes: zone.decorationTypes.split(",") as DecorationType[],
  }));

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href={`/admin/products/${productId}`} className="text-sm text-zinc-500">
        &larr; {view.productColor.product.name} ({view.productColor.name})
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">Print zones — {view.name}</h1>

      <div className="mt-6">
        <ZoneEditor
          productId={productId}
          productViewId={view.id}
          imageUrl={view.imageUrl}
          zones={zones}
        />
      </div>
    </main>
  );
}
