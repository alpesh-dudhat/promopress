import Link from "next/link";
import { registerUser } from "@/features/auth/actions";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-2xl font-semibold">Register</h1>
      <form action={registerUser} className="mt-6 flex flex-col gap-3">
        <input name="name" placeholder="Name" required className="rounded border px-3 py-2" />
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
          placeholder="Password (min 8 characters)"
          required
          minLength={8}
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Create account
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-600">
        Already have an account? <Link href="/login" className="underline">Log in</Link>
      </p>
    </main>
  );
}
