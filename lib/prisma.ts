import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Optional: Log connection errors to console
    log: ['error', 'warn'],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }: any) {
          const maxRetries = 3;
          let retries = 0;
          while (true) {
            try {
              return await query(args);
            } catch (error: any) {
              // Retry on connection errors (P1001: Can't reach db, P2024: Connection pool timeout)
              if (retries >= maxRetries || (error.code !== 'P1001' && error.code !== 'P2024')) {
                throw error;
              }
              retries++;
              console.warn(`[Prisma] Query failed, retrying (${retries}/${maxRetries})...`);
              await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 100)); // Exponential backoff
            }
          }
        },
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
