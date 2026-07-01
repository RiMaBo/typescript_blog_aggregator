import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config"

const cfg = readConfig();

export default defineConfig({
    schema: "src/lib/db",
    out: "src/lib/db/out",
    dialect: "postgresql",
    dbCredentials: {
        url: cfg.dbUrl,
    },
});
