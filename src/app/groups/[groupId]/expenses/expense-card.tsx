'use client'
import { CategoryExpenseIcon } from '@/components/category-icon'
import { APIExpense, APIGroup } from '@/lib/api'
import { getBalances } from '@/lib/balances'
import { cn, formatCurrency, getPaymentString } from '@/lib/utils'
import { ChevronRight, HistoryIcon, MessageSquareText } from 'lucide-react'
import { useMemo } from 'react'

type Props = {
  expense: APIExpense
  group: APIGroup
  activeUserId: string | null
  numMembers: number
  onClick: () => void
}

export function ExpenseCard({
  expense,
  group,
  activeUserId,
  numMembers,
  onClick,
}: Props) {
  const amount = useMemo(() => {
    return (expense.expenseType === 'INCOME' ? -1 : 1) * expense.amount
  }, [expense.amount, expense.expenseType])

  const paymentString = useMemo(
    () => getPaymentString(activeUserId, expense, numMembers),
    [activeUserId, expense, numMembers],
  )

  const balance = useMemo(() => {
    return activeUserId && expense.expenseType !== 'REIMBURSEMENT'
      ? getBalances([expense])?.[activeUserId]?.total || 0
      : 0
  }, [activeUserId, expense])

  const currency = group.currency

  return (
    <div
      className={cn(
        'flex sm:mx-6 px-4 sm:rounded-lg sm:pr-2 sm:pl-4 py-2 text-sm cursor-pointer hover:bg-accent gap-1',
        expense.expenseType === 'REIMBURSEMENT' && 'italic',
      )}
      onClick={onClick}
    >
      <CategoryExpenseIcon expense={expense} />
      <div className="flex-1 ml-2">
        <div className="sm:text-base mt-2 sm:mt-1">
          {expense.title}
          {expense.notes && (
            <MessageSquareText className="inline ml-1 mb-1 text-muted-foreground w-3 h-3" />
          )}
          {expense.prevVersionId && (
            <HistoryIcon className="inline ml-1 mb-1 text-muted-foreground w-3 h-3" />
          )}
        </div>
        <div className="text-xs text-muted-foreground">{paymentString}</div>
      </div>
      <div
        className={
          'flex flex-col items-end content-center whitespace-nowrap justify-center'
        }
      >
        <div
          className={cn(expense.expenseType === 'REIMBURSEMENT' || 'font-bold')}
        >
          {formatCurrency(currency, amount)}
        </div>
        {balance > 0 ? (
          <div className="text-xs mt-1">
            <span className="text-muted-foreground">you get </span>
            <strong className="text-green-600">
              {formatCurrency(currency, balance)}
            </strong>
          </div>
        ) : balance < 0 ? (
          <div className="text-xs mt-1">
            <span className="text-muted-foreground">you owe </span>
            <strong className="text-red-600">
              {formatCurrency(currency, -balance)}
            </strong>
          </div>
        ) : null}
      </div>
      <ChevronRight className="ml-1 w-4 h-4 self-center hidden sm:block" />
    </div>
  )
}
