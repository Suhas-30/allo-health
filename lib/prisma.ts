import { PrismaNeon } from "@prisma/adapter-neon"
import Prisma from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: Prisma.PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  })
  return new Prisma.PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}