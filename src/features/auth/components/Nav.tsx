import Link from "next/link";
import { getCurrentUser, logoutUser } from "@/features/auth/actions";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <nav className="no-print flex items-center justify-between border-b px-8 py-3 text-sm">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-semibold">
          PromoPress
        </Link>
        {user && (
          <>
            <Link href="/mockups">Mockups</Link>
            {user.role === "ADMIN" && (
              <>
                <Link href="/admin/products">Products</Link>
                <Link href="/admin/users">Users</Link>
              </>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-zinc-600">
              {user.name} ({user.role})
            </span>
            <form action={logoutUser}>
              <button type="submit" className="underline">
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
