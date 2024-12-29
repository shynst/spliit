import { cached } from '@/app/cached-functions'
import { CategoryExpenseIcon } from '@/components/category-icon'
import { DeleteExpensePopup } from '@/components/delete-expense-popup'
import { RouterButton } from '@/components/router-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APIExpense, APIGroup, getExpense } from '@/lib/api'
import {
  cn,
  formatCreateDate,
  formatCurrency,
  formatExpenseDate,
  getPaymentString,
} from '@/lib/utils'
import { Edit, HistoryIcon } from 'lucide-react'
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

  const isCurrentExpense = expense.expenseState === 'CURRENT'

  return (
    <div>
      <Card className="max-sm:mb-0">
        <CardHeader className="pb-3 sm:pb-6 flex flex-row justify-between">
          <CardTitle className="flex items-end gap-2">
            <CategoryExpenseIcon expense={expense} />
            <div className="ml-1 sm:ml-2 mb-1">{expense.title}</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:gap-6">
          <Item>
            <ItemLabel>Category</ItemLabel>
            <ItemContent>{expense.category?.name || 'General'}</ItemContent>
          </Item>

          <Item>
            <ItemLabel>Created by</ItemLabel>
            <ItemContent>
              {(expense.createdBy?.name || 'Someone') + ' at '}
              {formatCreateDate(expense.createdAt)}
            </ItemContent>
          </Item>

          <Item>
            <ItemLabel>Amount</ItemLabel>
            <ItemContent className="min-w-[80px]">
              {formatCurrency(group.currency, expense.amount)}
            </ItemContent>
          </Item>

          <Item>
            <ItemLabel>
              {eType === 'INCOME' ? 'Received by' : 'Paid by'}
            </ItemLabel>
            <ItemContent>
              {(expense.paidBy?.name || 'Someone') + ' at '}
              {formatExpenseDate(expense.expenseDate, { withYear: true })}
            </ItemContent>
          </Item>

          <Item className="col-span-2">
            <ItemLabel>{s_transaction}</ItemLabel>
            <ItemContent>{getPaymentString(null, expense)}</ItemContent>
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

      {history.length > 1 && (
        <Card>
          <CardHeader className="flex-row gap-2 space-y-0">
            <HistoryIcon />
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 pb-4 sm:p-0 sm:pb-6 flex flex-col gap-4">
            <ExpenseHistory group={group} expense={expense} history={history} />
          </CardContent>
        </Card>
      )}

      <div className="flex mt-4 gap-2">
        <RouterButton replace="edit">
          <Edit className="w-4 h-4 mr-2" />
          {'Edit' + (isCurrentExpense ? '' : ' as New')}
        </RouterButton>
        {isCurrentExpense && <DeleteExpensePopup expense={expense} />}
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
  <div className={cn('flex flex-col', className)}>{children}</div>
)

const ItemLabel = ({ children, className }: ItemProps) => (
  <div className={cn('mt-3 sm:mt-0 text-sm sm:text-base', className)}>
    {children}
  </div>
)

const ItemContent = ({ children, className }: ItemProps) => (
  <div
    className={cn(
      'mt-1 sm:mt-2 pb-1 text-xs text-muted-foreground border-b',
      className,
    )}
  >
    {children}
  </div>
)
