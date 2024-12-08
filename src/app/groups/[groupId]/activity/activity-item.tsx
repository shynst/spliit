'use client'
import { Button } from '@/components/ui/button'
import { getGroupExpenses } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Participant } from '@prisma/client'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type ExpenseVersion = Awaited<ReturnType<typeof getGroupExpenses>>[0]

type Props = {
  groupId: string
  participant?: Participant
  expenseVersion: ExpenseVersion
}

export function ActivityItem({ groupId, expenseVersion }: Props) {
  const router = useRouter()
  const summary = 'todo!'

  return (
    <div
      className="flex justify-between sm:rounded-lg px-2 sm:pr-1 sm:pl-2 py-2 text-sm hover:bg-accent gap-1 items-stretch cursor-pointer"
      onClick={() =>
        router.push(`/groups/${groupId}/expenses/${expenseVersion.id}/edit`)
      }
    >
      <div className="flex flex-col justify-between items-start">
        <div className="my-1 text-xs/5 text-muted-foreground">
          {formatDate(expenseVersion.createdAt)}
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
        <Link href={`/groups/${groupId}/expenses/${expenseVersion.id}/edit`}>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  )
}
