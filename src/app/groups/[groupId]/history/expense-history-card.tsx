'use client'
import { Button } from '@/components/ui/button'
import { APIExpense, APIGroup } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Props = {
  expense: APIExpense
  group: APIGroup
  activeUserId: string | null
}

export function ExpenseHistoryCard({ expense, group, activeUserId }: Props) {
  const router = useRouter()
  const userName =
    expense.createdById === activeUserId ? 'You' : expense.createdBy?.name ?? ''

  const action = expense.prevVersion
    ? expense.deleted
      ? 'deleted'
      : 'updated'
    : 'created'
  const summary = `${userName} ${action} "${expense.title}"`

  return (
    <div
      className="flex justify-between sm:rounded-lg px-2 sm:pr-1 sm:pl-2 py-2 text-sm hover:bg-accent gap-1 items-stretch cursor-pointer"
      onClick={() =>
        router.push(`/groups/${group.id}/expenses/${expense.id}/edit`)
      }
    >
      <div className="flex flex-col justify-between items-start">
        <div className="my-1 text-xs/5 text-muted-foreground">
          {formatDate(expense.createdAt)}
        </div>
      </div>
      <div className="flex-1">
        <div className="m-1">{summary}</div>
      </div>
      <Button
        size="icon"
        variant="link"
        className="self-center hidden sm:flex w-5 h-5"
        asChild
      >
        <Link href={`/groups/${group.id}/expenses/${expense.id}/edit`}>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  )
}
