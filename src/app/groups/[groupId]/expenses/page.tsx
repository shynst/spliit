import { cached } from '@/app/cached-functions'
import { ActiveUserModal } from '@/app/groups/[groupId]/expenses/active-user-modal'
import { CreateFromReceiptButton } from '@/app/groups/[groupId]/expenses/create-from-receipt-button'
import { ExpenseList } from '@/app/groups/[groupId]/expenses/expense-list'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getCategories,
  getGroupExpenseCount,
  getGroupExpenses,
} from '@/lib/api'
import { env } from '@/lib/env'
import { Plus } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Expenses',
}

export default async function GroupExpensesPage({
  params: { groupId },
}: {
  params: { groupId: string }
}) {
  const group = await cached.getGroup(groupId)
  if (!group) notFound()

  const categories = await getCategories()

  return (
    <>
      <Card>
        <div className="flex flex-1">
          <CardHeader className="flex-1 max-sm:pb-0">
            <CardTitle>Expenses</CardTitle>
            <CardDescription className="max-sm:hidden">
              Here are the expenses that were created for your group.
            </CardDescription>
          </CardHeader>
          <CardHeader className="flex flex-row space-y-0 gap-2 max-sm:pb-0">
            {env.NEXT_PUBLIC_ENABLE_RECEIPT_EXTRACT && (
              <CreateFromReceiptButton
                groupId={groupId}
                groupCurrency={group.currency}
                categories={categories}
              />
            )}
            <Button asChild size="icon">
              <Link
                href={`/groups/${groupId}/expenses/create`}
                title="Create expense"
              >
                <Plus className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
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
            <Expenses group={group} />
          </Suspense>
        </CardContent>
      </Card>

      <ActiveUserModal group={group} />
    </>
  )
}

type Props = {
  group: NonNullable<Awaited<ReturnType<typeof cached.getGroup>>>
}

async function Expenses({ group }: Props) {
  const expenseCount = await getGroupExpenseCount(group.id)

  const expenses = await getGroupExpenses(group.id, {
    offset: 0,
    length: 200,
  })

  return (
    <ExpenseList
      expensesFirstPage={expenses}
      expenseCount={expenseCount}
      groupId={group.id}
      currency={group.currency}
      participants={group.participants}
    />
  )
}
