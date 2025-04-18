import { cached } from '@/app/cached-functions'
import { ExpenseListPage } from '@/app/groups/expense-list-page'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600
export const metadata: Metadata = { title: 'History' }

export default async function ExpensesHistoryPage(props: {
  params: Promise<{ groupId: string }>
}) {
  'use server'

  const { groupId } = await props.params

  const group = await cached.getGroup(groupId)
  if (!group) notFound()

  return <ExpenseListPage group={group} includeHistory={true} />
}
