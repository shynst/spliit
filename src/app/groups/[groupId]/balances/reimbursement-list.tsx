import { Button } from '@/components/ui/button'
import { APIGroup } from '@/lib/api'
import { Reimbursement } from '@/lib/balances'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

type Props = {
  group: APIGroup
  currency: string
  reimbursements: Reimbursement[]
}

export function ReimbursementList({ group, currency, reimbursements }: Props) {
  const getParticipantName = (id: string) =>
    group.participants.find((p) => p.id === id)?.name || 'Someone'

  const uriCurrency = encodeURIComponent(currency)

  return (
    <div className="text-sm">
      {reimbursements.map((reimbursement, index) => (
        <div
          className="pb-4 grid grid-cols-[1fr_max-content_max-content]"
          key={index}
        >
          <div>
            <strong>{getParticipantName(reimbursement.from)}</strong> owes{' '}
            <strong>{getParticipantName(reimbursement.to)}</strong>
          </div>
          <div>{formatCurrency(currency, reimbursement.amount)}</div>

          <Button
            variant="link"
            asChild
            className="ml-4 p-0 h-[20px] justify-self-end"
          >
            <Link
              href={`/groups/${group.id}/expenses/create?reimbursement=yes&from=${reimbursement.from}&to=${reimbursement.to}&amount=${reimbursement.amount}&currency=${uriCurrency}`}
            >
              Mark as paid
            </Link>
          </Button>
        </div>
      ))}
    </div>
  )
}
