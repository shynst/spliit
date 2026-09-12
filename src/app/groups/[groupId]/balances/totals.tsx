'use client'
import { cached } from '@/app/cached-functions'
import { APIGroup, Balances } from '@/lib/api'
import { cn, formatCurrency } from '@/lib/utils'

type Props = { group: APIGroup; balances: Balances }

export function Totals({ group, balances }: Props) {
  const userBalances = balances.userBalances
  const activeUser = cached.getActiveUser(group.id)

  const totalSpendings = userBalances
    .values()
    .reduce((sum, v) => sum + v.groupAmount, 0)

  const balance =
    activeUser && activeUser !== 'None'
      ? userBalances.get(activeUser)
      : undefined

  const currency = balances.currency.symbol

  return (
    <div className="text-sm pb-3 sm:pb-2">
      <StatItem
        label="Group $balance"
        amount={totalSpendings}
        currency={currency}
        colored={false}
      />

      {balance && (
        <>
          <StatItem
            label="Your $balance"
            amount={balance.groupAmount}
            currency={currency}
            colored={true}
          />
          <StatItem
            label="Your share"
            amount={balance.groupAmount + balance.paidFor - balance.paidBy}
            currency={currency}
            colored={true}
          />
        </>
      )}
    </div>
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
    <div className="text-sm pb-1 sm:pb-2 flex justify-between">
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
