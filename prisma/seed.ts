import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EXPENSE_CATEGORIES = [
  "Food",
  "Rent",
  "Groceries",
  "Electricity",
  "Internet",
  "Petrol",
  "Transport",
  "Entertainment",
  "Maintenance",
  "Other",
];

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Rental Income",
  "Bonus",
  "Other",
];

async function main() {
  const existingExpense = await prisma.category.count({
    where: { roomId: null, type: "expense" },
  });
  if (existingExpense === 0) {
    await prisma.category.createMany({
      data: EXPENSE_CATEGORIES.map((name) => ({ name, type: "expense", roomId: null })),
    });
    console.log(`Created ${EXPENSE_CATEGORIES.length} expense categories.`);
  } else {
    console.log("Expense categories already exist, skipping.");
  }

  const existingIncome = await prisma.category.count({
    where: { roomId: null, type: "income" },
  });
  if (existingIncome === 0) {
    await prisma.category.createMany({
      data: INCOME_CATEGORIES.map((name) => ({ name, type: "income", roomId: null })),
    });
    console.log(`Created ${INCOME_CATEGORIES.length} income categories.`);
  } else {
    console.log("Income categories already exist, skipping.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
