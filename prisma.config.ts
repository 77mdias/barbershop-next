// prisma.config.ts
import { defineConfig } from "@prisma/config";
import path from "node:path";
import * as dotenv from "dotenv";
import * as fs from "fs";

const envFile: string =
  process.env.NODE_ENV === "development" ? ".env.development" : ".env";

// ⚠️ FORÇA o carregamento do .env ANTES de qualquer coisa
const envPath = path.resolve(process.cwd(), envFile);
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    throw result.error;
  }
  console.log("✅ Arquivo .env carregado com sucesso");
  console.log(
    "📊 DATABASE_URL:",
    process.env.DATABASE_URL ? "✅ Definida" : "❌ Não definida"
  );
} else {
  console.warn("⚠️  Arquivo .env não encontrado em:", envPath);
  console.warn("📝 Crie um arquivo .env na raiz do projeto com DATABASE_URL");
}

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
});
