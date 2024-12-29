import { cached } from '@/app/cached-functions'
import { ExpenseForm } from '@/components/expense-form'
import { createExpense, getExpense, updateExpense } from '@/lib/api'
import { getRuntimeFeatureFlags } from '@/lib/featureFlags'
import { expenseFormSchema } from '@/lib/schemas'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Edit expense',
}

export default async function EditExpensePage({
  params: { groupId, expenseId },
}: {
  params: { groupId: string; expenseId: string }
}) {
  'use server'
  const group = await cached.getGroup(groupId)
  if (!group) notFound()
  const expense = await getExpense(expenseId)
  if (!expense) notFound()
  const categories = await cached.getCategories()

  async function updateOrCreateAction(
    createNew: boolean,
    values: unknown,
    participantId: string | null,
  ) {
    'use server'
    const expenseFormValues = expenseFormSchema.parse(values)

    if (createNew) {
      await createExpense(expenseFormValues, groupId, participantId)
    } else {
      await updateExpense(expenseFormValues, expenseId, groupId, participantId)
    }
    redirect(`/groups/${groupId}`)
  }

  return (
    <Suspense>
      <ExpenseForm
        group={group}
        expense={expense}
        categories={categories}
        onSubmit={updateOrCreateAction}
        runtimeFeatureFlags={await getRuntimeFeatureFlags()}
      />
    </Suspense>
  )
}
