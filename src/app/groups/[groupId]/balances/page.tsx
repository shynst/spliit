import { cached } from '@/app/cached-functions'
import { BalancesList } from '@/app/groups/[groupId]/balances/balances-list'
import { ReimbursementList } from '@/app/groups/[groupId]/balances/reimbursement-list'
import { Totals } from '@/app/groups/[groupId]/balances/totals'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getExpenseList } from '@/lib/api'
import {
  getBalances,
  getPublicBalances,
  getSuggestedReimbursements,
  getTotalGroupSpending,
} from '@/lib/balances'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Balances',
}

export default async function GroupPage({
  params: { groupId },
}: {
  params: { groupId: string }
}) {
  const group = await cached.getGroup(groupId)
  if (!group) notFound()

  const expenses = await getExpenseList(groupId)
  const totalGroupSpendings = getTotalGroupSpending(expenses)
  const balances = getBalances(expenses)
  const reimbursements = getSuggestedReimbursements(balances)
  const publicBalances = getPublicBalances(reimbursements)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Balances</CardTitle>
          <CardDescription>
            This is the amount that each participant paid or was paid for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BalancesList group={group} balances={publicBalances} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Suggested reimbursements</CardTitle>
          <CardDescription>
            Here are suggestions for optimized reimbursements between
            participants.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <ReimbursementList group={group} reimbursements={reimbursements} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
          <CardDescription>
            Spending summary of the entire group.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <Totals
            group={group}
            expenses={expenses}
            totalGroupSpendings={totalGroupSpendings}
          />
        </CardContent>
      </Card>
    </>
  )
}
