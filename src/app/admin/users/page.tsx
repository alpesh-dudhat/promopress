import { listUsers, setUserRole } from "@/features/auth/actions";
import type { UserRole } from "@/features/auth/types";

// Reads live database state — must not be statically prerendered.
export const dynamic = "force-dynamic";

const ROLES: UserRole[] = ["ADMIN", "SALES", "CUSTOMER"];

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Users</h1>
      <ul className="mt-6 flex flex-col gap-2">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between rounded border p-3 text-sm">
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-zinc-600">
                {u.email} · {u.role}
              </div>
            </div>
            <div className="flex gap-2">
              {ROLES.filter((r) => r !== u.role).map((r) => (
                <form key={r} action={setUserRole.bind(null, u.id, r)}>
                  <button type="submit" className="rounded border px-2 py-1 text-xs">
                    Make {r}
                  </button>
                </form>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
