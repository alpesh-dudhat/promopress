import { db } from "@/lib/db";

// Placeholder until real authentication/login exists. Every mockup needs a
// createdBy user, so until then all mockups are attributed to this single
// seeded user. Replace with the logged-in user's id once auth is built.
const SYSTEM_USER_EMAIL = "system@promopress.local";

export async function getSystemUserId(): Promise<string> {
  const user = await db.user.upsert({
    where: { email: SYSTEM_USER_EMAIL },
    update: {},
    create: {
      email: SYSTEM_USER_EMAIL,
      name: "System",
      password: "unused-no-auth-yet",
      role: "ADMIN",
    },
  });
  return user.id;
}
