import { cached } from '@/app/cached-functions'
import { ExpenseForm } from '@/components/expense-form'
import { createExpense } from '@/lib/api'
import { getRuntimeFeatureFlags } from '@/lib/featureFlags'
import { expenseFormSchema } from '@/lib/schemas'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Create expense',
}

export default async function ExpensePage(props: {
  params: Promise<{ groupId: string }>
}) {
  'use server'

  const { groupId } = await props.params

  const group = await cached.getGroup(groupId)
  if (!group) notFound()
  const categories = await cached.getCategories()

  async function createExpenseAction(
    _createNew: boolean,
    values: unknown,
    participantId: string | null,
  ) {
    'use server'
    const expenseFormValues = expenseFormSchema.parse(values)
    await createExpense(expenseFormValues, groupId, participantId)
    redirect(`/groups/${groupId}`)
  }

  return (
    <Suspense>
      <ExpenseForm
        group={group}
        categories={categories}
        onSubmit={createExpenseAction}
        runtimeFeatureFlags={await getRuntimeFeatureFlags()}
      />
    </Suspense>
  )
}
