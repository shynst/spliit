import { APIExpense } from '@/lib/api'

function getBalance(expense: APIExpense) {
  const t = expense.expenseType
  return t === 'REIMBURSEMENT' ? 0 : (t === 'INCOME' ? -1 : 1) * expense.amount
}

export function getTotalGroupSpending(expenses: APIExpense[]): number {
  return expenses.reduce((total, expense) => total + getBalance(expense), 0)
}

export function getTotalActiveUserPaidFor(
  activeUserId: string | null,
  expenses: APIExpense[],
): number {
  return expenses.reduce(
    (total, expense) =>
      expense.paidBy.id === activeUserId ? total + getBalance(expense) : total,
    0,
  )
}

export function getTotalActiveUserShare(
  activeUserId: string | null,
  expenses: APIExpense[],
): number {
  let total = 0

  expenses.forEach((expense) => {
    const paidFors = expense.paidFor
    const userPaidFor = paidFors.find(
      (paidFor) => paidFor.participant.id === activeUserId,
    )

    const balance = getBalance(expense)
    if (balance === 0 || !userPaidFor) {
      // if balance == 0 (reimbursement) or
      // active user is not involved in the expense, skip expense
      return
    }

    switch (expense.splitMode) {
      case 'EVENLY':
        // Divide the total expense evenly among all participants
        total += balance / paidFors.length
        break
      case 'BY_AMOUNT':
        // Directly add the user's share if the split mode is BY_AMOUNT
        total += userPaidFor.shares
        break
      case 'BY_PERCENTAGE':
        // Calculate the user's share based on their percentage of the total expense
        total += (balance * userPaidFor.shares) / 10000 // Assuming shares are out of 10000 for percentage
        break
      case 'BY_SHARES':
        // Calculate the user's share based on their shares relative to the total shares
        const totalShares = paidFors.reduce(
          (sum, paidFor) => sum + paidFor.shares,
          0,
        )
        if (totalShares > 0) {
          total += (balance * userPaidFor.shares) / totalShares
        }
        break
    }
  })

  return parseFloat(total.toFixed(2))
}
