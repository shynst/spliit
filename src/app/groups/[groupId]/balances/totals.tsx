'use client'
import { cached } from '@/app/cached-functions'
import { APIExpenseBalance, APIGroup } from '@/lib/api'
import {
  getTotalActiveUserPaidFor,
  getTotalActiveUserShare,
} from '@/lib/balances'
import { cn, formatCurrency } from '@/lib/utils'

type Props = {
  group: APIGroup
  expenses: APIExpenseBalance[]
  currency: string
  totalSpendings: number
}

export function Totals({ group, expenses, currency, totalSpendings }: Props) {
  const activeUser = cached.getActiveUser(group.id)

  return (
    <>
      <StatItem
        label="Group $balance"
        amount={totalSpendings}
        currency={currency}
        colored={false}
      />

      {activeUser && activeUser !== 'None' && (
        <>
          <StatItem
            label="Your $balance"
            amount={getTotalActiveUserPaidFor(activeUser, expenses)}
            currency={currency}
            colored={true}
          />
          <StatItem
            label="Your share"
            amount={getTotalActiveUserShare(activeUser, expenses)}
            currency={currency}
            colored={true}
          />
        </>
      )}
    </>
  )
}

type StatProps = {
  label: string
  amount: number
  currency: string
  colored: boolean
}

function StatItem({ label, amount, currency, colored }: StatProps) {
  const balance = amount < 0 ? 'earnings' : 'spendings'
  label = label.replaceAll('$balance', balance)

  return (
    <div className="text-sm pb-4 flex justify-between">
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
