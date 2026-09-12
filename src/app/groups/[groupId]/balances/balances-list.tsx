import { APIGroup, Balances } from '@/lib/api'
import { cn, formatCurrency } from '@/lib/utils'
import React from 'react'

type Props = { group: APIGroup; balances: Balances }

export function BalancesList({ group, balances }: Props) {
  const userBalances = balances.userBalances
  const maxBalance = Math.max(
    ...userBalances.values().map((b) => Math.abs(b.paidBy - b.paidFor)),
  )

  return (
    <div className="text-sm">
      {group.participants.map((participant) => {
        const b = userBalances.get(participant.id)
        const balance = (b?.paidBy ?? 0) - (b?.paidFor ?? 0)
        if (balance == 0)
          return <React.Fragment key={participant.id}></React.Fragment>

        const isLeft = balance >= 0
        return (
          <div
            key={participant.id}
            className={cn('flex', isLeft || 'flex-row-reverse')}
          >
            <div className={cn('w-1/2 p-1 sm:p-2', isLeft && 'text-right')}>
              {participant.name}
            </div>
            <div className={cn('w-1/2 relative', isLeft || 'text-right')}>
              <div className="absolute inset-0 p-2 max-sm:pt-1 z-20">
                {formatCurrency(balances.currency.symbol, balance)}
              </div>
              <div
                className={cn(
                  'absolute top-1 h-6 sm:h-7 z-10',
                  isLeft
                    ? 'bg-green-200 dark:bg-green-800 left-0 rounded-r border border-green-300 dark:border-green-700'
                    : 'bg-red-200 dark:bg-red-800 right-0 rounded-l border  border-red-300 dark:border-red-700',
                )}
                style={{
                  width: (Math.abs(balance) / maxBalance) * 100 + '%',
                }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
