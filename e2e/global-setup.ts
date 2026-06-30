import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";

// Runs once before the whole e2e suite: builds a fresh test.db from the
// real migrations and seeds the bootstrap admin, so every run starts from
// a known, clean state.
export default function globalSetup() {
  for (const file of ["test.db", "test.db-journal"]) {
    if (existsSync(file)) unlinkSync(file);
  }

  const env = { ...process.env, DATABASE_URL: "file:./test.db" };
  execSync("npx prisma migrate deploy", { stdio: "inherit", env });
  execSync("npx prisma db seed", { stdio: "inherit", env });
}
