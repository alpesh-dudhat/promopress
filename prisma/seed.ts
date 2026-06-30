// One-time bootstrap for the very first admin account. Self-registration
// can never grant ADMIN (see registerUser in src/features/auth/actions.ts),
// so this is the only way to create one. Run with: npx prisma db seed
// Override the defaults with SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD env vars.

import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@promopress.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Admin", password: hashedPassword, role: "ADMIN" },
  });

  console.log(`Seeded admin user: ${email} / ${password}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
