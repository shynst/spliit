import { Currency, Participant } from '@prisma/client'
import { Balances } from './api'

export type Reimbursement = {
  from: Participant['id']
  to: Participant['id']
  amount: number
  currency: Currency
}

type BalanceItem = { participantId: string; amount: number; currency: Currency }

/**
 * A comparator that is stable across reimbursements.
 * This ensures that a participant executing a suggested reimbursement
 * does not result in completely new repayment suggestions.
 */
function compareBalancesForReimbursements(
  b1: BalanceItem,
  b2: BalanceItem,
): number {
  // positive balances come before negative balances
  if (b1.amount > 0 && 0 > b2.amount) {
    return -1
  } else if (b2.amount > 0 && 0 > b1.amount) {
    return 1
  }
  // if signs match, sort based on user id
  return b1.participantId < b2.participantId ? -1 : 1
}

export function getSuggestedReimbursements(
  balances: Balances,
): Reimbursement[] {
  const balancesArray = balances.userBalances
    .entries()
    .map(([participantId, { paidBy, paidFor }]) => ({
      participantId,
      amount: paidBy - paidFor,
      currency: balances.currency,
    }))
    .filter((b) => b.amount !== 0)
    .toArray()
  balancesArray.sort(compareBalancesForReimbursements)
  const reimbursements: Reimbursement[] = []
  while (balancesArray.length > 1) {
    const first = balancesArray[0]
    const last = balancesArray[balancesArray.length - 1]
    const amount = first.amount + last.amount
    if (first.amount > -last.amount) {
      reimbursements.push({
        from: last.participantId,
        to: first.participantId,
        amount: -last.amount,
        currency: first.currency,
      })
      first.amount = amount
      balancesArray.pop()
    } else {
      reimbursements.push({
        from: last.participantId,
        to: first.participantId,
        amount: first.amount,
        currency: last.currency,
      })
      last.amount = amount
      balancesArray.shift()
    }
  }
  return reimbursements.filter(({ amount }) => Math.round(amount) + 0 !== 0)
}
