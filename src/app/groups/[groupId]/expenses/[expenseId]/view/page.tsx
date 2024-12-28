import { cached } from '@/app/cached-functions'
import { CategoryExpenseIcon } from '@/components/category-icon'
import { RouterButton } from '@/components/router-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APIExpense, APIGroup, getExpense } from '@/lib/api'
import { cn, formatCurrency, getPaymentString } from '@/lib/utils'
import { Edit } from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ExpenseHistory } from './expense-history'

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

  const history: APIExpense[] = []
  let e: APIExpense | null | undefined
  for (e = expense.nextVersion; e; e = e.nextVersion) history.unshift(e)
  for (e = expense; e; e = e.prevVersion) history.push(e)

  return <ViewExpense group={group} expense={expense} history={history} />
}

function ViewExpense({
  group,
  expense,
  history,
}: {
  group: APIGroup
  expense: APIExpense
  history: APIExpense[]
}) {
  const eType = expense.expenseType
  const s_transaction =
    eType === 'REIMBURSEMENT'
      ? 'Refund'
      : eType[0] + eType.slice(1).toLowerCase()

  return (
    <div>
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
            <ItemLabel>Category</ItemLabel>
            <ItemContent>{expense.category?.name || 'General'}</ItemContent>
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

          <Item className="col-span-2">
            <ItemLabel>{getPaymentString(null, expense)}</ItemLabel>
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
        <CardContent className="p-0 pt-2 pb-4 sm:p-0 sm:pb-6 flex flex-col gap-4">
          <ExpenseHistory group={group} expense={expense} history={history} />
        </CardContent>
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
    </div>
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

function formatDate(date?: Date) {
  if (!date || isNaN(date as any)) date = new Date()
  return date.toISOString().substring(0, 10)
}
