import { PrismaNeon } from "@prisma/adapter-neon"

// @ts-ignore
import pkg from "@prisma/client"

// @ts-ignore
const { PrismaClient } = pkg

const globalForPrisma = global as unknown as { prisma: any }

function createPrismaClient() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  })
  return new PrismaClient({ adapter })
}

export const prisma: any = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}