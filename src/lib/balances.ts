import { APIExpenseBalance } from '@/lib/api'
import { Participant } from '@prisma/client'
import { match } from 'ts-pattern'

export type Balances = Record<
  Participant['id'],
  { paid: number; paidFor: number; total: number }
>

export type Reimbursement = {
  from: Participant['id']
  to: Participant['id']
  amount: number
}

function getBalance(expense: APIExpenseBalance) {
  const t = expense.expenseType
  return t === 'REIMBURSEMENT' ? 0 : (t === 'INCOME' ? -1 : 1) * expense.amount
}

export function getTotalGroupSpending(expenses: APIExpenseBalance[]): number {
  return expenses.reduce((total, expense) => total + getBalance(expense), 0)
}

export function getTotalActiveUserPaidFor(
  activeUserId: string | null,
  expenses: APIExpenseBalance[],
): number {
  return expenses.reduce(
    (total, expense) =>
      expense.paidBy.id === activeUserId ? total + getBalance(expense) : total,
    0,
  )
}

export function getTotalActiveUserShare(
  activeUserId: string | null,
  expenses: APIExpenseBalance[],
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

export function getBalances(expenses: APIExpenseBalance[]): Balances {
  const balances: Balances = {}

  for (const expense of expenses) {
    const paidBy = expense.paidBy.id
    const paidFors = expense.paidFor
    const amount = (expense.expenseType === 'INCOME' ? -1 : 1) * expense.amount

    if (!balances[paidBy]) balances[paidBy] = { paid: 0, paidFor: 0, total: 0 }
    balances[paidBy].paid += amount

    const totalPaidForShares = paidFors.reduce(
      (sum, paidFor) => sum + paidFor.shares,
      0,
    )
    let remaining = amount
    paidFors.forEach((paidFor, index) => {
      if (!balances[paidFor.participant.id])
        balances[paidFor.participant.id] = { paid: 0, paidFor: 0, total: 0 }

      const isLast = index === paidFors.length - 1

      const [shares, totalShares] = match(expense.splitMode)
        .with('EVENLY', () => [1, paidFors.length])
        .with('BY_SHARES', () => [paidFor.shares, totalPaidForShares])
        .with('BY_PERCENTAGE', () => [paidFor.shares, totalPaidForShares])
        .with('BY_AMOUNT', () => [paidFor.shares, totalPaidForShares])
        .exhaustive()

      if (totalShares !== 0) {
        const dividedAmount = isLast
          ? remaining
          : (amount * shares) / totalShares
        remaining -= dividedAmount
        balances[paidFor.participant.id].paidFor += dividedAmount
      }
    })
  }

  // rounding and add total
  for (const participantId in balances) {
    // add +0 to avoid negative zeros
    balances[participantId].paidFor =
      Math.round(balances[participantId].paidFor) + 0
    balances[participantId].paid = Math.round(balances[participantId].paid) + 0

    balances[participantId].total =
      balances[participantId].paid - balances[participantId].paidFor
  }
  return balances
}

export function getPublicBalances(reimbursements: Reimbursement[]): Balances {
  const balances: Balances = {}
  reimbursements.forEach((reimbursement) => {
    if (!balances[reimbursement.from])
      balances[reimbursement.from] = { paid: 0, paidFor: 0, total: 0 }

    if (!balances[reimbursement.to])
      balances[reimbursement.to] = { paid: 0, paidFor: 0, total: 0 }

    balances[reimbursement.from].paidFor += reimbursement.amount
    balances[reimbursement.from].total -= reimbursement.amount

    balances[reimbursement.to].paid += reimbursement.amount
    balances[reimbursement.to].total += reimbursement.amount
  })
  return balances
}

/**
 * A comparator that is stable across reimbursements.
 * This ensures that a participant executing a suggested reimbursement
 * does not result in completely new repayment suggestions.
 */
function compareBalancesForReimbursements(b1: any, b2: any): number {
  // positive balances come before negative balances
  if (b1.total > 0 && 0 > b2.total) {
    return -1
  } else if (b2.total > 0 && 0 > b1.total) {
    return 1
  }
  // if signs match, sort based on userid
  return b1.participantId < b2.participantId ? -1 : 1
}

export function getSuggestedReimbursements(
  balances: Balances,
): Reimbursement[] {
  const balancesArray = Object.entries(balances)
    .map(([participantId, { total }]) => ({ participantId, total }))
    .filter((b) => b.total !== 0)
  balancesArray.sort(compareBalancesForReimbursements)
  const reimbursements: Reimbursement[] = []
  while (balancesArray.length > 1) {
    const first = balancesArray[0]
    const last = balancesArray[balancesArray.length - 1]
    const amount = first.total + last.total
    if (first.total > -last.total) {
      reimbursements.push({
        from: last.participantId,
        to: first.participantId,
        amount: -last.total,
      })
      first.total = amount
      balancesArray.pop()
    } else {
      reimbursements.push({
        from: last.participantId,
        to: first.participantId,
        amount: first.total,
      })
      last.total = amount
      balancesArray.shift()
    }
  }
  return reimbursements.filter(({ amount }) => Math.round(amount) + 0 !== 0)
}
