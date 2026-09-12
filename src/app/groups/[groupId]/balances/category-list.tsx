import { CategoryIcon } from '@/components/category-icon'
import { Balances } from '@/lib/api'
import { cn, formatCurrency } from '@/lib/utils'
import React from 'react'

export function CategoryList({ balances }: { balances: Balances }) {
  const catBalances = balances.categoryBalances
  const maxBalance = Math.max(...catBalances.values().map((b) => b.amount))

  return (
    <table className="text-sm mb-5">
      <tbody>
        {catBalances
          .entries()
          .toArray()
          .map(([category, { icon, amount }]) => {
            if (amount == 0)
              return <React.Fragment key={category}></React.Fragment>

            return (
              <tr key={category}>
                <td className="pr-2">
                  <CategoryIcon category={{ icon }} />
                </td>
                <td className="whitespace-nowrap pr-2">{category}</td>
                <td className="w-full pb-1">
                  <div
                    className={cn(
                      'pl-2 sm:h-7 sm:leading-7',
                      amount >= 0
                        ? 'bg-red-200 dark:bg-red-800 left-0 rounded-r border border-red-300 dark:border-red-700'
                        : 'font-bold text-green-600',
                    )}
                    style={{
                      width: (Math.abs(amount) / maxBalance) * 100 + '%',
                    }}
                  >
                    {formatCurrency(balances.currency.symbol, Math.abs(amount))}
                  </div>
                </td>
              </tr>
            )
          })}
      </tbody>
    </table>
  )
}
