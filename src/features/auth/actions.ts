"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth, requireAdmin, signIn, signOut } from "@/lib/auth";
import type { UserRole } from "@/features/auth/types";

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    throw new Error("Name, email, and a password of at least 8 characters are required.");
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  // Self-registration is always CUSTOMER. Promotion to SALES/ADMIN is an
  // admin-only action (see setUserRole) — never trust a client-submitted role.
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.user.create({
    data: { name, email, password: hashedPassword, role: "CUSTOMER" },
  });

  await signInOrRedirectError(email, password);
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  await signInOrRedirectError(email, password);
}

async function signInOrRedirectError(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirectTo: "/mockups" });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Invalid email or password.");
    }
    // Auth.js signals a successful redirect by throwing a special
    // NEXT_REDIRECT error — re-throw anything that isn't an auth failure
    // so that redirect can actually happen.
    throw error;
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}

export async function listUsers() {
  await requireAdmin();
  return db.user.findMany({ orderBy: { createdAt: "desc" } });
}

export async function setUserRole(userId: string, role: UserRole) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    throw new Error("You can't change your own role.");
  }
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
