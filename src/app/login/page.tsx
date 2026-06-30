import Link from "next/link";
import { loginUser } from "@/features/auth/actions";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form action={loginUser} className="mt-6 flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Log in
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-600">
        No account? <Link href="/register" className="underline">Register</Link>
      </p>
    </main>
  );
}
