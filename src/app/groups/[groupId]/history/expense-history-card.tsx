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

const getAmount = (currency: string, expense: APIExpense | null) =>
  expense &&
  formatCurrency(
    currency,
    (expense.expenseType === 'INCOME' ? -1 : 1) * expense.amount,
  )

const getChangeInfo = <T,>(changed: any, prev: T, current: T) => ({
  changed: !!changed,
  prev: prev || undefined,
  curr: current || undefined,
})

function ChangeSpan({ info }: { info: ReturnType<typeof getChangeInfo> }) {
  const { prev, curr } = info
  if (!prev || prev === curr) return String(curr)
  return curr ? (
    <span>
      <span className="text-red-600 font-normal line-through">
        {String(prev)}
      </span>
      {' → '}
      <span className="text-green-600">{String(curr)}</span>
    </span>
  ) : (
    <span className="text-red-600 font-normal line-through">
      {String(prev)}
    </span>
  )
}

type HistoryInfoProps = {
  expense: APIExpense
  group: APIGroup
  activeUserId: string | null
  numMembers: number
}

const getHistoryInfo = ({
  expense,
  group,
  activeUserId,
  numMembers,
}: HistoryInfoProps) => {
  const prevExp = expense.prevVersion ?? null
  const action = prevExp
    ? expense.expenseState === 'DELETED'
      ? 'deleted'
      : 'updated'
    : 'created'
  const currExp = action === 'deleted' ? null : expense

  const title = currExp?.title
  const prevTitle = prevExp?.title
  const titleChanged = prevTitle && prevTitle !== title

  const currency = group.currency
  const amount = getAmount(currency, currExp)
  const prevAmount = getAmount(currency, prevExp)
  const amountChanged = prevAmount && prevAmount !== amount

  const payment = currExp && getPaymentString(activeUserId, currExp, numMembers)
  const prevPay = prevExp && getPaymentString(activeUserId, prevExp, numMembers)
  const payChanged = prevPay && prevPay !== payment

  const userName =
    expense.createdById === activeUserId
      ? 'You'
      : expense.createdBy?.name || 'Someone'

  const summary =
    formatCreateDate(expense.createdAt) + `: ${userName} ${action}`

  const cat = currExp?.category?.id
  const prevCat = prevExp?.category?.id
  const catChanged = prevExp && currExp && prevCat !== cat

  const date = currExp?.expenseDate.getDate()
  const prevDate = prevExp?.expenseDate.getDate()
  const dateChanged = prevExp && currExp && prevDate !== date

  const notes = currExp?.notes
  const prevNotes = prevExp?.notes
  const notesChanged = notes && notes !== prevNotes

  return {
    summary,
    action,
    title: getChangeInfo(titleChanged, prevTitle, title),
    category: getChangeInfo(catChanged, prevCat, cat),
    date: getChangeInfo(dateChanged, prevDate, date),
    amount: getChangeInfo(amountChanged, prevAmount, amount),
    payment: getChangeInfo(payChanged, prevPay, payment),
    notes: getChangeInfo(notesChanged, prevNotes, notes),
  }
}

type ExpenseHistoryInfo = ReturnType<typeof getHistoryInfo>

const isMayorChange = (historyInfo: ExpenseHistoryInfo) => {
  const { title, amount, payment, notes } = historyInfo
  return title.changed || amount.changed || payment.changed || notes.changed
}

type ExpenseHistoryCardProps = {
  expense: APIExpense
  historyInfo: ExpenseHistoryInfo
  selected: boolean
  onClick: () => void
}

export function ExpenseHistoryCard({
  expense,
  historyInfo,
  selected,
  onClick,
}: ExpenseHistoryCardProps) {
  const { summary, title, category, date, amount, payment, notes } = historyInfo
  const selectable = historyInfo.action !== 'deleted' && !selected
  const notesAction = notes.changed
    ? !notes.prev
      ? 'Notes added'
      : !notes.curr
      ? 'Notes removed'
      : 'Notes changed'
    : null

  return (
    <div
      className={cn([
        'flex sm:mx-6 px-4 sm:rounded-lg sm:pr-2 sm:pl-4 py-2 text-sm gap-1',
        selectable && 'cursor-pointer hover:bg-accent',
        selected && 'border',
      ])}
      onClick={() => selectable && onClick()}
    >
      <div className="relative">
        <CategoryExpenseIcon
          textClassName={cn(
            date.changed && 'text-green-600 border-green-600 border-b-2',
          )}
          expense={expense}
        />
        {category.changed && (
          <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-green-600 fill-green-600" />
        )}
      </div>
      <div className="flex-1 ml-2 content-center">
        <div className="text-sm">
          {summary + ' "'}
          <ChangeSpan info={title} />
          {'"'}
        </div>
        <div className="text-xs text-muted-foreground">
          <ChangeSpan info={payment} />
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
        <ChangeSpan info={amount} />
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

ExpenseHistoryCard.getHistoryInfo = getHistoryInfo
ExpenseHistoryCard.isMayorChange = isMayorChange
