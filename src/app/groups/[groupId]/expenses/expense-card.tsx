'use client'
import { CategoryIcon } from '@/app/groups/[groupId]/expenses/category-icon'
import { Button } from '@/components/ui/button'
import { getGroupExpenses } from '@/lib/api'
import { cn, formatCurrency, formatExpenseDate } from '@/lib/utils'
import { Participant } from '@prisma/client'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fragment } from 'react'

type Props = {
  expense: Awaited<ReturnType<typeof getGroupExpenses>>[number]
  participants: Participant[]
  currency: string
  groupId: string
}

export function ExpenseCard({
  expense,
  currency,
  participants,
  groupId,
}: Props) {
  const getParticipant = (id: string) => participants.find((p) => p.id === id)
  const router = useRouter()

  return (
    <div
      key={expense.id}
      className={cn(
        'flex justify-between sm:mx-6 px-4 sm:rounded-lg sm:pr-2 sm:pl-4 py-4 text-sm cursor-pointer hover:bg-accent gap-1 items-stretch',
        expense.isReimbursement && 'italic',
      )}
      onClick={() => {
        router.push(`/groups/${groupId}/expenses/${expense.id}/edit`)
      }}
    >
      <CategoryIcon
        category={expense.category}
        className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground"
      />
      <div className="flex-1">
        <div className={cn('mb-1', expense.isReimbursement && 'italic')}>
          {expense.title}
        </div>
        <div className="text-xs text-muted-foreground">
          Paid by <strong>{getParticipant(expense.paidById)?.name}</strong> for{' '}
          {expense.paidFor.map((paidFor: any, index: number) => (
            <Fragment key={index}>
              {index !== 0 && <>, </>}
              <strong>
                {participants.find((p) => p.id === paidFor.participantId)?.name}
              </strong>
            </Fragment>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-between items-end">
        <div
          className={cn(
            'tabular-nums whitespace-nowrap',
            expense.isReimbursement ? 'italic' : 'font-bold',
          )}
        >
          {formatCurrency(currency, expense.amount)}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatExpenseDate(expense.expenseDate)}
        </div>
      </div>
      <Button
        size="icon"
        variant="link"
        className="self-center hidden sm:flex"
        asChild
      >
        <Link href={`/groups/${groupId}/expenses/${expense.id}/edit`}>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  )
}