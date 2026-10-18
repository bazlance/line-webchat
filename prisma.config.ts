import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // migrations need a direct connection, not the pooled one
    url: process.env["DATABASE_URL_UNPOOLED"],
  },
});
