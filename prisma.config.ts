import "dotenv/config";
import { defineConfig } from "prisma/config";

console.log("process.env.DATABASE_URL:", process.env.DATABASE_URL);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
