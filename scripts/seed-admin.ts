// Run manually once (not on every deploy) whenever the admin account needs
// to be created or its password rotated:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npx tsx scripts/seed-admin.ts
// Upserts by email, so re-running it after changing ADMIN_PASSWORD rotates
// the existing admin's password hash instead of erroring on the unique
// email constraint.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const BCRYPT_ROUNDS = 12;

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD env vars are required.");
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("ADMIN_PASSWORD should be at least 12 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const admin = await prisma.admin.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });

  console.log(`Admin account ready for ${admin.email} (id: ${admin.id}).`);
}

main()
  .catch((error) => {
    console.error("Failed to seed admin account:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
