import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD ?? "")}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}${process.env.DB_SSL === "true" ? "?sslmode=require" : ""}`;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.js",
  out: "./drizzle",
  dbCredentials: { url },
  // pgSchema() namespaces are created by the migration SQL itself.
  schemaFilter: [
    "public",
    "admins_schema",
    "user_schema",
    "farms_schema",
    "location_schema",
    "company_schema",
    "vendor_schema",
    "website_schema",
  ],
  verbose: true,
  strict: true,
});
