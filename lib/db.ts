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
          let delay = 300; // start with 300ms
          
          while (true) {
            try {
              return await query(args);
            } catch (error: any) {
              // Retry on connection errors:
              // P1001: Can't reach db
              // P2024: Connection pool timeout
              // 53300: Postgres too many connections (common during cold starts)
              // 57P03: Postgres starting up (Neon waking up)
              
              const isConnectionError = 
                error.code === 'P1001' || 
                error.code === 'P2024' ||
                error.message?.includes('53300') ||
                error.message?.includes('57P03') ||
                error.message?.includes('timeout') ||
                error.message?.includes('Connection terminated');

              if (retries >= maxRetries || !isConnectionError) {
                throw error; // Throw if max retries reached or it's a legitimate query error
              }
              
              retries++;
              console.warn(`[Database] Query failed, retrying (${retries}/${maxRetries}) in ${delay}ms... Error: ${error.code || 'Unknown'}`);
              await new Promise((resolve) => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff (300ms, 600ms, 1200ms)
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

// Next.js Hot Reloading safe singleton
export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
