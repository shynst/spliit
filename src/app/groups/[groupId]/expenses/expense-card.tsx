'use client'
import { CategoryExpenseIcon } from '@/app/groups/[groupId]/expenses/category-icon'
import { Button } from '@/components/ui/button'
import { getGroupExpenses } from '@/lib/api'
import { getBalances } from '@/lib/balances'
import { cn, formatCurrency } from '@/lib/utils'
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
        'flex sm:mx-6 px-4 sm:rounded-lg sm:pr-2 sm:pl-4 py-2 text-sm cursor-pointer hover:bg-accent gap-1',
        expense.isReimbursement && 'italic',
      )}
      onClick={() => {
        router.push(`/groups/${groupId}/expenses/${expense.id}/edit`)
      }}
    >
      <div className="flex flex-col justify-center">
        <CategoryExpenseIcon expense={expense} />
      </div>
      <div className="flex-1 ml-2">
        <div className="sm:text-base mt-2 sm:mt-1">{expense.title}</div>
        <div className="text-xs text-muted-foreground">
          {getName(expense.paidBy, 'You')} paid{' '}
          {expense.isReimbursement || 'for '}
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
        className={
          'flex flex-col items-end content-center whitespace-nowrap justify-center'
        }
      >
        <div className={cn(expense.isReimbursement || 'font-bold')}>
          {formatCurrency(currency, expense.amount)}
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
