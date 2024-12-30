'use client'
import { cached } from '@/app/cached-functions'
import { APIExpense, APIGroup } from '@/lib/api'
import {
  getTotalActiveUserPaidFor,
  getTotalActiveUserShare,
} from '@/lib/balances'
import { cn, formatCurrency } from '@/lib/utils'

export function Totals({
  group,
  expenses,
  totalGroupSpendings,
}: {
  group: APIGroup
  expenses: APIExpense[]
  totalGroupSpendings: number
}) {
  const activeUser = cached.getActiveUser(group.id)

  const currency = 'TODO'

  return (
    <>
      <StatItem
        label="Total group $balance"
        amount={totalGroupSpendings}
        currency={currency}
        colored={false}
      />

      {activeUser && activeUser !== 'None' && (
        <>
          <StatItem
            label="Your total $balance"
            amount={getTotalActiveUserPaidFor(activeUser, expenses)}
            currency={currency}
            colored={true}
          />
          <StatItem
            label="Your total share"
            amount={getTotalActiveUserShare(activeUser, expenses)}
            currency={currency}
            colored={true}
          />
        </>
      )}
    </>
  )
}

function StatItem({
  label,
  amount,
  currency,
  colored,
}: {
  label: string
  amount: number
  currency: string
  colored: boolean
}) {
  const balance = amount < 0 ? 'earnings' : 'spendings'
  label = label.replaceAll('$balance', balance)

  return (
    <div className="text-sm border-t p-4 sm:p-6 flex justify-between">
      <div>{label}</div>
      <div
        className={cn(
          colored && (amount < 0 ? 'text-green-600' : 'text-red-600'),
        )}
      >
        {formatCurrency(currency, Math.abs(amount))}
      </div>{' '}
    </div>
  )
}
