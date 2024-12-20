'use client'
import { CategoryExpenseIcon } from '@/components/category-icon'
import { Button } from '@/components/ui/button'
import { APIExpense, APIGroup } from '@/lib/api'
import {
  cn,
  formatCreateDate,
  formatCurrency,
  getPaymentInfo,
} from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

type Props = {
  expense: APIExpense
  group: APIGroup
  activeUserId: string | null
  numMembers: number
}

const getAmount = (currency: string, expense: APIExpense | null) => {
  return (
    expense &&
    formatCurrency(
      currency,
      (expense.expenseType === 'INCOME' ? -1 : 1) * expense.amount,
    )
  )
}

function ChangeSpan({
  prev,
  curr,
}: {
  prev: string | null | undefined
  curr: string | null | undefined
}) {
  if (!prev || prev === curr) return curr
  return curr ? (
    <span>
      <span className="text-red-600 font-normal line-through">{prev}</span>
      {' → '}
      <span className="text-green-600">{curr}</span>
    </span>
  ) : (
    <span className="text-red-600 font-normal line-through">{prev}</span>
  )
}

export function ExpenseHistoryCard({
  expense,
  group,
  activeUserId,
  numMembers,
}: Props) {
  const router = useRouter()

  const prevExp = expense.prevVersion ?? null
  const action = prevExp
    ? expense.expenseState === 'DELETED'
      ? 'deleted'
      : 'updated'
    : 'created'
  const currExp = action === 'deleted' ? null : expense

  const amount = getAmount(group.currency, currExp)
  const amountPrev = getAmount(group.currency, prevExp)

  const paymentInfo = useMemo(
    () => currExp && getPaymentInfo(activeUserId, currExp, numMembers),
    [activeUserId, currExp, numMembers],
  )
  const prevPaymentInfo = useMemo(
    () => prevExp && getPaymentInfo(activeUserId, prevExp, numMembers),
    [activeUserId, prevExp, numMembers],
  )

  const userName =
    expense.createdById === activeUserId
      ? 'you'
      : expense.createdBy?.name ?? 'someone'

  const summary =
    formatCreateDate(expense.createdAt) + `: ${userName} ${action}`

  const catChanged =
    prevExp && currExp && prevExp.category?.id !== currExp.category?.id

  const dateChanged =
    prevExp &&
    currExp &&
    prevExp.expenseDate.getDate() !== currExp.expenseDate.getDate()

  const notes = currExp?.notes ?? null
  const prevNotes = prevExp?.notes ?? null
  const notesAction =
    notes !== prevNotes
      ? !prevNotes
        ? 'Notes added'
        : !notes
        ? 'Notes removed'
        : 'Notes changed'
      : null

  const editLink = `/groups/${group.id}/expenses/${expense.id}/view`

  return (
    <div
      className="flex sm:mx-6 px-4 sm:rounded-lg sm:pr-2 sm:pl-4 py-2 text-sm cursor-pointer hover:bg-accent gap-1"
      onClick={() => router.push(editLink)}
    >
      <div className="flex flex-col justify-center">
        <CategoryExpenseIcon
          className={cn(catChanged && 'border-2 border-green-600')}
          textClassName={cn(dateChanged && 'text-green-600 font-bold')}
          expense={expense}
        />
      </div>
      <div className="flex-1 ml-2 content-center">
        <div className="text-sm">
          {summary + ' "'}
          <ChangeSpan prev={prevExp?.title} curr={currExp?.title} />
          {'"'}
        </div>
        <div className="text-xs text-muted-foreground">
          <ChangeSpan prev={prevPaymentInfo} curr={paymentInfo} />
          {notesAction && (
            <>
              {', '}
              <span
                className={cn(
                  notesAction.endsWith('removed')
                    ? 'text-red-600 line-through'
                    : 'text-green-600',
                )}
              >
                {notesAction}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end content-center font-bold whitespace-nowrap justify-center">
        <ChangeSpan prev={amountPrev} curr={amount} />
      </div>
      <Button
        size="icon"
        variant="link"
        className="self-center hidden sm:flex"
        asChild
      >
        <Link href={editLink}>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  )
}
