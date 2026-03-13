// Debt simplification algorithm to minimize the number of transactions
export interface Balance {
  userId: string;
  userName: string;
  amount: number; // Positive means they are owed money, negative means they owe money
}

export interface SimplifiedDebt {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

/**
 * Simplifies debts to minimize the number of transactions
 * 
 * Algorithm:
 * 1. Calculate net balances for each person
 * 2. Separate debtors (negative balance) and creditors (positive balance)
 * 3. Match debtors with creditors to settle debts
 * 4. Optimize to minimize number of transactions
 */
export function simplifyDebts(balances: Balance[]): SimplifiedDebt[] {
  // Step 1: Calculate net balances
  const netBalances = new Map<string, number>();
  const userNames = new Map<string, string>();
  
  balances.forEach(balance => {
    netBalances.set(balance.userId, (netBalances.get(balance.userId) || 0) + balance.amount);
    userNames.set(balance.userId, balance.userName);
  });

  // Step 2: Separate debtors and creditors
  const debtors: { userId: string; amount: number }[] = [];
  const creditors: { userId: string; amount: number }[] = [];

  netBalances.forEach((amount, userId) => {
    if (Math.abs(amount) < 0.01) return; // Skip negligible amounts
    
    if (amount < 0) {
      debtors.push({ userId, amount: -amount }); // Store as positive for easier calculation
    } else {
      creditors.push({ userId, amount });
    }
  });

  // Step 3: Match debtors with creditors
  const simplifiedDebts: SimplifiedDebt[] = [];
  
  // Sort debtors and creditors by amount (largest first)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    
    const settlementAmount = Math.min(debtor.amount, creditor.amount);
    
    if (settlementAmount > 0.01) { // Only add significant settlements
      simplifiedDebts.push({
        fromUserId: debtor.userId,
        fromUserName: userNames.get(debtor.userId) || 'Unknown',
        toUserId: creditor.userId,
        toUserName: userNames.get(creditor.userId) || 'Unknown',
        amount: Math.round(settlementAmount * 100) / 100, // Round to 2 decimal places
      });
    }
    
    // Update amounts
    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;
    
    // Move to next debtor if current one is settled
    if (debtor.amount < 0.01) {
      debtorIndex++;
    }
    
    // Move to next creditor if current one is settled
    if (creditor.amount < 0.01) {
      creditorIndex++;
    }
  }

  return simplifiedDebts;
}

/**
 * Calculates the minimum number of transactions needed
 * This is a theoretical minimum - the actual number may be higher due to rounding
 */
export function calculateMinimumTransactions(balances: Balance[]): number {
  const netBalances = new Map<string, number>();
  
  balances.forEach(balance => {
    netBalances.set(balance.userId, (netBalances.get(balance.userId) || 0) + balance.amount);
  });

  const nonZeroBalances = Array.from(netBalances.values()).filter(amount => Math.abs(amount) >= 0.01);
  
  // The minimum number of transactions is at most (n-1) where n is the number of people with non-zero balances
  return Math.max(0, nonZeroBalances.length - 1);
}

/**
 * Validates if the simplified debts result in the same final balances
 */
export function validateSimplification(
  originalBalances: Balance[], 
  simplifiedDebts: SimplifiedDebt[]
): boolean {
  // Calculate final balances from simplified debts
  const finalBalances = new Map<string, number>();
  
  // Initialize with original balances
  originalBalances.forEach(balance => {
    finalBalances.set(balance.userId, balance.amount);
  });
  
  // Apply simplified debts
  simplifiedDebts.forEach(debt => {
    finalBalances.set(debt.fromUserId, (finalBalances.get(debt.fromUserId) || 0) - debt.amount);
    finalBalances.set(debt.toUserId, (finalBalances.get(debt.toUserId) || 0) + debt.amount);
  });
  
  // Check if all balances are close to zero (within rounding error)
  for (const [userId, balance] of finalBalances) {
    if (Math.abs(balance) > 0.01) {
      return false;
    }
  }
  
  return true;
}

/**
 * Example usage:
 * 
 * const balances: Balance[] = [
 *   { userId: "1", userName: "Alice", amount: 150 },  // Alice is owed $150
 *   { userId: "2", userName: "Bob", amount: -50 },   // Bob owes $50
 *   { userId: "3", userName: "Charlie", amount: -100 } // Charlie owes $100
 * ];
 * 
 * const simplified = simplifyDebts(balances);
 * // Result: Bob pays Alice $50, Charlie pays Alice $100
 * // Instead of: Bob pays Alice $50, Charlie pays Bob $50, Bob pays Alice $50
 */
