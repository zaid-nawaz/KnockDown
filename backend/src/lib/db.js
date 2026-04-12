import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// ✅ Ensure env is loaded properly
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL is not defined. Check your .env file.");
}

// ✅ Correct adapter usage
const adapter = new PrismaNeon({
  connectionString,
});

// ✅ Singleton pattern (prevents multiple instances in dev)
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

// ✅ Store in global (only in dev)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;