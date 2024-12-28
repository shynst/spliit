'use client'
import { CategoryExpenseIcon } from '@/components/category-icon'
import { APIExpense, APIGroup } from '@/lib/api'
import {
  cn,
  formatCreateDate,
  formatCurrency,
  getPaymentString,
} from '@/lib/utils'
import { ChevronRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

type Props = {
  expense: APIExpense
  group: APIGroup
  selected: boolean
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
  selected,
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
  const selectable = action !== 'deleted' && !selected

  const amount = getAmount(group.currency, currExp)
  const amountPrev = getAmount(group.currency, prevExp)

  const paymentString = useMemo(
    () => currExp && getPaymentString(activeUserId, currExp, numMembers),
    [activeUserId, currExp, numMembers],
  )
  const prevPaymentString = useMemo(
    () => prevExp && getPaymentString(activeUserId, prevExp, numMembers),
    [activeUserId, prevExp, numMembers],
  )

  const userName =
    expense.createdById === activeUserId
      ? 'You'
      : expense.createdBy?.name ?? 'Someone'

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
      className={cn([
        'flex sm:mx-6 px-4 sm:rounded-lg sm:pr-2 sm:pl-4 py-2 text-sm gap-1',
        selectable && 'cursor-pointer hover:bg-accent',
        selected && 'border border-primary',
      ])}
      onClick={() => selectable && router.push(editLink)}
    >
      <div className="relative">
        <CategoryExpenseIcon
          textClassName={cn(
            dateChanged && 'text-green-600 border-green-600 border-b-2',
          )}
          expense={expense}
        />
        {catChanged && (
          <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-green-600 fill-green-600" />
        )}
      </div>
      <div className="flex-1 ml-2 content-center">
        <div className="text-sm">
          {summary + ' "'}
          <ChangeSpan prev={prevExp?.title} curr={currExp?.title} />
          {'"'}
        </div>
        <div className="text-xs text-muted-foreground">
          <ChangeSpan prev={prevPaymentString} curr={paymentString} />
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
      <ChevronRight
        className={cn([
          'ml-1 w-4 h-4 self-center hidden sm:block',
          !selectable && 'sm:invisible',
        ])}
      />
    </div>
  )
}
