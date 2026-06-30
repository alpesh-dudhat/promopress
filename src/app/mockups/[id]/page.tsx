import Link from "next/link";
import { notFound } from "next/navigation";
import { getMockup } from "@/features/mockups/actions";
import { MockupPreview } from "@/features/mockups/components/MockupPreview";
import { PrintButton } from "@/features/mockups/components/PrintButton";
import { StatusActions } from "@/features/mockups/components/StatusActions";
import type { MockupStatus } from "@/features/mockups/types";

// Reads live database state — must not be statically prerendered.
export const dynamic = "force-dynamic";

export default async function MockupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mockup = await getMockup(id);
  if (!mockup) notFound();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/mockups" className="no-print text-sm text-zinc-500">
        &larr; All mockups
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{mockup.salesOrderRef}</h1>

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <MockupPreview imageUrl={mockup.productView.imageUrl} placements={mockup.placements} />

        <div className="flex w-full flex-col gap-3 md:w-64">
          <table className="text-sm">
            <tbody>
              <tr>
                <td className="pr-3 font-medium">Product</td>
                <td>{mockup.product.name}</td>
              </tr>
              <tr>
                <td className="pr-3 font-medium">Color</td>
                <td>{mockup.productColor.name}</td>
              </tr>
              <tr>
                <td className="pr-3 font-medium">View</td>
                <td>{mockup.productView.name}</td>
              </tr>
              {mockup.placements.map((p) => (
                <tr key={p.id}>
                  <td className="pr-3 font-medium">{p.zone.label}</td>
                  <td>
                    {p.decorationType} ·{" "}
                    {((p.widthPct / 100) * p.zone.maxWidthCm).toFixed(1)}cm x{" "}
                    {((p.heightPct / 100) * p.zone.maxHeightCm).toFixed(1)}cm
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <StatusActions mockupId={mockup.id} status={mockup.status as MockupStatus} />
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
