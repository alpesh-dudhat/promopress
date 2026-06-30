import { setMockupStatus } from "@/features/mockups/actions";
import type { MockupStatus } from "@/features/mockups/types";

export function StatusActions({ mockupId, status }: { mockupId: string; status: MockupStatus }) {
  return (
    <div className="no-print flex items-center gap-2">
      <span className="text-sm text-zinc-600">Status: {status}</span>
      <form action={setMockupStatus.bind(null, mockupId, "APPROVED")}>
        <button type="submit" className="rounded bg-green-600 px-3 py-1 text-sm text-white">
          Approve
        </button>
      </form>
      <form action={setMockupStatus.bind(null, mockupId, "REJECTED")}>
        <button type="submit" className="rounded bg-red-600 px-3 py-1 text-sm text-white">
          Reject
        </button>
      </form>
    </div>
  );
}
