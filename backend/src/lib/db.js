import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
const { PrismaClient } = pkg;


const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined. Check your .env file.");
}

const adapter = new PrismaNeon({
  connectionString,
});


const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });


if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;