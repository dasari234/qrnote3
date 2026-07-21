import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 1. Establish the native PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 60000,
    ssl: {
      rejectUnauthorized: false
    }
});

// 2. Instantiate the Driver Adapter (Pass the pool variable directly)
const adapter = new PrismaPg(pool);

// 3. Initialize your singleton client wrapper safely
export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
