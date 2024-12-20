import { cached } from '@/app/cached-functions'
import { CategoryExpenseIcon } from '@/components/category-icon'
import { RouterButton } from '@/components/router-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APIExpense, APIGroup, getExpense } from '@/lib/api'
import {
  cn,
  formatCreateDate,
  formatCurrency,
  getPaymentInfo,
} from '@/lib/utils'
import { Edit } from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'View expense' }

export default async function ViewExpensePage({
  params: { groupId, expenseId },
}: {
  params: { groupId: string; expenseId: string }
}) {
  'use server'
  const group = await cached.getGroup(groupId)
  if (!group) notFound()
  const expense = await getExpense(expenseId, { includeHistory: true })
  if (!expense) notFound()

  let str = 'NEXT VERSIONS\n\n'
  let e = expense.nextVersion
  const reversed: APIExpense[] = []
  while (e) {
    reversed.unshift(e)
    e = e.nextVersion
  }
  for (const e of reversed) str += formatExpense(e)

  str += '\n\nCURRENT\n\n' + formatExpense(expense)

  str += '\n\nPREV VERSIONS\n\n'
  e = expense.prevVersion
  while (e) {
    str += formatExpense(e)
    e = e.prevVersion
  }

  return <ViewExpense group={group} expense={expense} historyTODO={str} />
}

function ViewExpense({
  group,
  expense,
  historyTODO,
}: {
  group: APIGroup
  expense: APIExpense
  historyTODO: string
}) {
  const paidFor = expense.paidFor
  const numPaid = paidFor.length

  const eType = expense.expenseType
  const s_transaction =
    eType === 'REIMBURSEMENT'
      ? 'Refund'
      : eType[0] + eType.slice(1).toLowerCase()

  const s_Paid = eType === 'INCOME' ? 'Received' : 'Paid'

  const splitMode = expense.splitMode

  const paidForTitle =
    s_Paid +
    ' for ' +
    (numPaid === 0
      ? 'none'
      : numPaid === 1
      ? paidFor[0].participant.name
      : numPaid === group.participants.length
      ? 'all'
      : String(numPaid) + ' participants') +
    (splitMode !== 'EVENLY' ? ' unevenly' : '')

  return (
    <>
      <Card className="max-sm:mb-0">
        <CardHeader className="pb-3 sm:pb-6 flex flex-row justify-between">
          <CardTitle className="flex items-end gap-2">
            <CategoryExpenseIcon expense={expense} />
            <div className="mb-1">{expense.title}</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:gap-6">
          <Item>
            <ItemLabel>Type</ItemLabel>
            <ItemContent>{s_transaction}</ItemContent>
          </Item>

          <Item>
            <ItemLabel>{s_Paid} by</ItemLabel>
            <ItemContent>{expense.paidBy.name}</ItemContent>
          </Item>

          <Item>
            <ItemLabel>Date</ItemLabel>
            <ItemContent className="date-base">
              {formatDate(expense.expenseDate)}
            </ItemContent>
          </Item>

          <Item>
            <ItemLabel>Amount</ItemLabel>
            <ItemContent className="min-w-[80px]">
              {formatCurrency(group.currency, expense.amount)}
            </ItemContent>
          </Item>

          <Item>
            <ItemLabel>{s_Paid} for</ItemLabel>
            <ItemContent>{paidForTitle}</ItemContent>
          </Item>

          {!!expense.notes && (
            <Item className="col-span-2">
              <ItemLabel>Notes</ItemLabel>
              <ItemContent className="whitespace-pre-wrap sm:block">
                {expense.notes}
              </ItemContent>
            </Item>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Log</CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-line">{historyTODO}</CardContent>
      </Card>

      <div className="flex mt-4 gap-2">
        <RouterButton replace="edit">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </RouterButton>
        <RouterButton variant="ghost" back>
          Close
        </RouterButton>
      </div>
    </>
  )
}

interface ItemProps {
  children: React.ReactNode
  className?: string
}

const Item = ({ children, className }: ItemProps) => (
  <div className={cn('space-y-2 text-base', className)}>{children}</div>
)

const ItemLabel = ({ children, className }: ItemProps) => (
  <div
    className={cn('block sm:inline mt-1 -mb-1 sm:mr-2 font-bold', className)}
  >
    {children}
  </div>
)

const ItemContent = ({ children, className }: ItemProps) => (
  <div className={cn('block sm:inline text-base', className)}>{children}</div>
)

const formatExpense = (expense: APIExpense) => {
  return `${expense.id}: ${formatCreateDate(expense.createdAt)}: ${
    expense.title
  } ${getPaymentInfo(null, expense, 10)}\n`
}

function formatDate(date?: Date) {
  if (!date || isNaN(date as any)) date = new Date()
  return date.toISOString().substring(0, 10)
}
