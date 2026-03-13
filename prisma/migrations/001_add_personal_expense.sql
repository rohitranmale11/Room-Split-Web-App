-- Create PersonalExpense table
CREATE TABLE "PersonalExpense" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalExpense_pkey" PRIMARY KEY ("id")
);

-- Create UserBudget table
CREATE TABLE "UserBudget" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBudget_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserBudget_userId_month_year_key" UNIQUE ("userId", "month", "year")
);

-- Add foreign key constraints
ALTER TABLE "PersonalExpense" ADD CONSTRAINT "PersonalExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonalExpense" ADD CONSTRAINT "PersonalExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserBudget" ADD CONSTRAINT "UserBudget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update Category table to include personalExpenses relation
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "personalExpenses" TEXT[];
