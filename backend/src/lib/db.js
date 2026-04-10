import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

const sql = neon(connectionString);
const adapter = new PrismaNeon(sql);

const prismaClientSingleton = () => {
    return new PrismaClient({
        adapter,
    });
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}