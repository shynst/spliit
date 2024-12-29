import { cached } from '@/app/cached-functions'
import { ActiveUserModal } from '@/app/groups/[groupId]/expenses/active-user-modal'
import { CreateFromReceiptButton } from '@/app/groups/[groupId]/expenses/create-from-receipt-button'
import { ExpenseList } from '@/app/groups/expense-list'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { APIGroup, getExpenseCount, getExpenseList } from '@/lib/api'
import { env } from '@/lib/env'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

type Props = { group: APIGroup; includeHistory: boolean }

export async function ExpenseListPage({ group, includeHistory }: Props) {
  'use server'

  const categories = await cached.getCategories()

  return (
    <>
      <Card>
        <div className="flex flex-1">
          <CardHeader className="flex-1 max-sm:pb-0">
            <CardTitle>{includeHistory ? 'History' : 'Expenses'}</CardTitle>
            <CardDescription className="max-sm:hidden">
              {includeHistory
                ? 'This is a list of all the changes to expenses in your group.'
                : 'Here are the expenses that were created for your group.'}
            </CardDescription>
          </CardHeader>
          {!includeHistory && (
            <CardHeader className="flex flex-row space-y-0 gap-2 max-sm:pb-0">
              {env.NEXT_PUBLIC_ENABLE_RECEIPT_EXTRACT && (
                <CreateFromReceiptButton
                  group={group}
                  categories={categories}
                />
              )}
              <Button asChild size="icon">
                <Link
                  href={`/groups/${group.id}/expenses/create`}
                  title="Create expense"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
          )}
        </div>

        <CardContent className="p-0 pt-2 pb-4 sm:p-0 sm:pb-6 flex flex-col gap-4 relative">
          <Suspense
            fallback={[0, 1, 2].map((i) => (
              <div
                key={i}
                className="border-t flex justify-between items-center px-6 py-4 text-sm"
              >
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
            ))}
          >
            <Expenses group={group} includeHistory={includeHistory} />
          </Suspense>
        </CardContent>
      </Card>

      <ActiveUserModal group={group} />
    </>
  )
}

async function Expenses({ group, includeHistory }: Props) {
  'use server'

  const expenseCount = await getExpenseCount(group.id, { includeHistory })

  const expenses = await getExpenseList(group.id, {
    offset: 0,
    length: 200,
    includeHistory,
  })

  return (
    <ExpenseList
      group={group}
      preloadedExpenses={expenses}
      expenseCount={expenseCount}
      listType={includeHistory ? 'history' : 'expenses'}
    />
  )
}
