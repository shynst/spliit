'use client'
import { CategoryIcon } from '@/app/groups/[groupId]/expenses/category-icon'
import { Button } from '@/components/ui/button'
import { getGroupExpenses } from '@/lib/api'
import { getBalances } from '@/lib/balances'
import { cn, formatCurrency, formatExpenseDate } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fragment, useMemo } from 'react'

type Props = {
  expense: Awaited<ReturnType<typeof getGroupExpenses>>[number]
  currency: string
  groupId: string
  activeUserId: string | null
  numMembers: number
}

export function ExpenseCard({
  expense,
  currency,
  groupId,
  activeUserId,
  numMembers,
}: Props) {
  const router = useRouter()

  const getName = ({ id, name }: { id: string; name: string }, you: string) =>
    id === activeUserId ? you : name

  const balance = useMemo(() => {
    return activeUserId && !expense.isReimbursement
      ? getBalances([expense])?.[activeUserId]?.total || 0
      : 0
  }, [activeUserId, expense])

  return (
    <div
      key={expense.id}
      className={cn(
        'flex justify-between sm:mx-6 px-4 sm:rounded-lg sm:pr-2 sm:pl-4 py-4 text-sm cursor-pointer hover:bg-accent gap-1 items-stretch',
        expense.isReimbursement && 'italic',
      )}
      onClick={() => {
        router.push(`/groups/${groupId}/expenses/${expense.id}/edit`)
      }}
    >
      <div className="flex flex-col justify-between items-center">
        <CategoryIcon
          category={expense.category}
          className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground"
        />
        <div className="text-xs text-muted-foreground">
          {formatExpenseDate(expense.expenseDate)}
        </div>
      </div>
      <div className="flex-1 ml-2">
        <div className={cn('mb-1', expense.isReimbursement && 'italic')}>
          {expense.title}
        </div>
        <div className="text-xs text-muted-foreground">
          {getName(expense.paidBy, 'You')} paid {expense.isReimbursement || 'for '}
          {expense.paidFor.length < numMembers
            ? expense.paidFor.map((paidFor, index) => (
                <Fragment key={index}>
                  {(index > 0 ? ', ' : '') +
                    getName(paidFor.participant, 'you')}
                </Fragment>
              ))
            : 'all'}
        </div>
      </div>
      <div
        className={cn(
          'flex flex-col items-end content-center',
          balance == 0 ? 'justify-center' : 'justify-between',
        )}
      >
        <div
          className={cn(
            'tabular-nums whitespace-nowrap',
            expense.isReimbursement ? 'italic' : 'font-bold',
          )}
        >
          {formatCurrency(currency, expense.amount)}
        </div>
        {balance > 0 ? (
          <div className="text-xs text-green-600">
            you get <strong>{formatCurrency(currency, balance)}</strong>
          </div>
        ) : balance < 0 ? (
          <div className="text-xs text-red-600">
            you owe <strong>{formatCurrency(currency, -balance)}</strong>
          </div>
        ) : null}
      </div>
      <Button
        size="icon"
        variant="link"
        className="self-center hidden sm:flex"
        asChild
      >
        <Link href={`/groups/${groupId}/expenses/${expense.id}/edit`}>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  )
}
