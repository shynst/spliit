import { cached } from '@/app/cached-functions'
import { APIExpense, getExpense } from '@/lib/api'
import { formatCreateDate, getPaymentInfo } from '@/lib/utils'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'View expense',
}

const formatExpense = (expense: APIExpense) => {
  return `${expense.id}: ${formatCreateDate(expense.createdAt)}: ${
    expense.title
  } ${getPaymentInfo(null, expense, 10)}\n`
}

export default async function ViewExpensePage({
  params: { groupId, expenseId },
}: {
  params: { groupId: string; expenseId: string }
}) {
  const group = await cached.getGroup(groupId)
  if (!group) notFound()
  const expense = await getExpense(expenseId, { includeHistory: true })
  if (!expense) notFound()
  const categories = await cached.getCategories()

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

  return (
    <Suspense>
      <div className="whitespace-pre-line">{str}</div>
    </Suspense>
  )
}
