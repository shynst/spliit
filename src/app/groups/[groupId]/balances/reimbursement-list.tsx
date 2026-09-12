import { Button } from '@/components/ui/button'
import { APIGroup } from '@/lib/api'
import { Reimbursement } from '@/lib/balances'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

type Props = { group: APIGroup; reimbursements: Reimbursement[] }

export function ReimbursementList({ group, reimbursements }: Props) {
  const getParticipantName = (id: string) =>
    group.participants.find((p) => p.id === id)?.name || 'Someone'

  return (
    <div className="text-sm pb-3 sm:pb-2">
      {reimbursements.map((r, index) => (
        <div
          className="pb-1 sm:pb-2 grid grid-cols-[1fr_max-content_max-content]"
          key={index}
        >
          <div>
            <strong>{getParticipantName(r.from)}</strong> owes{' '}
            <strong>{getParticipantName(r.to)}</strong>
          </div>
          <div>{formatCurrency(r.currency.symbol, r.amount)}</div>

          <Button
            variant="link"
            asChild
            className="ml-4 p-0 h-[20px] justify-self-end"
          >
            <Link
              href={
                `/groups/${group.id}/expenses/create?reimbursement=yes&from=${r.from}` +
                `&to=${r.to}&amount=${r.amount}` +
                `&currency=${encodeURIComponent(r.currency.code)}`
              }
            >
              Mark as paid
            </Link>
          </Button>
        </div>
      ))}
    </div>
  )
}
