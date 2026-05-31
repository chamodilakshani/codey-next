import { PrismaClient } from "../app/generated/prisma/client"; 
import { PrismaPg } from "@prisma/adapter-pg"; 
const globalForPrisma = global as unknown as {
  prisma?: PrismaClient; 
}; 
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL, 
}); 

function createPrismaClient() {
  return new PrismaClient({
    adapter, 
  });
}

const prisma =
  process.env.NODE_ENV === "production"
    ? createPrismaClient()
    : (globalForPrisma.prisma ??= createPrismaClient());

export default prisma; 
