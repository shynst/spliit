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
import { getBalancesByCurrency } from '@/lib/api'
import { Reimbursement, getSuggestedReimbursements } from '@/lib/balances'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import * as React from 'react'

// cspell:ignore doesn

export const metadata: Metadata = {
  title: 'Balances',
}

type Props = { params: Promise<{ groupId: string }> }
type ListWithCurrencyProps = { currency: string; children: React.ReactNode }

export default async function GroupPage(props: Props) {
  const { groupId } = await props.params

  const group = await cached.getGroup(groupId)
  if (!group) notFound()

  const balanceMap = await getBalancesByCurrency(groupId)
  const reimbursementMap = new Map<string, Reimbursement[]>()

  balanceMap.forEach((balances, currency) => {
    const r = getSuggestedReimbursements(balances)
    if (r.length) reimbursementMap.set(currency, r)
  })

  const multiCurrencies = balanceMap.size > 1

  const ListWithCurrency = ({ currency, children }: ListWithCurrencyProps) =>
    multiCurrencies ? (
      <div className="ml-4">
        <p className="text-muted-foreground text-xs font-semibold border-b -ml-4 mb-4">
          Amounts in {currency}
        </p>
        {children}
      </div>
    ) : (
      <div>{children}</div>
    )

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
          {(() => {
            if (balanceMap.size === 0) {
              return (
                <div className="text-sm">
                  Your group doesn’t contain any expenses.
                </div>
              )
            }

            return reimbursementMap.size == 0 ? (
              <div className="text-sm">All group balances are settled.</div>
            ) : (
              balanceMap
                .entries()
                .filter(([currency]) => reimbursementMap.has(currency))
                .toArray()
                .map(([currency, balances]) => (
                  <ListWithCurrency key={currency} currency={currency}>
                    <BalancesList
                      group={group}
                      currency={currency}
                      balances={balances}
                    />
                  </ListWithCurrency>
                ))
            )
          })()}
        </CardContent>
      </Card>
      {balanceMap.size > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Suggested reimbursements</CardTitle>
              <CardDescription>
                Here are suggestions for optimized reimbursements between
                participants.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                return reimbursementMap.size == 0 ? (
                  <div className="text-sm">
                    Your group doesn’t need any reimbursement.
                  </div>
                ) : (
                  reimbursementMap
                    .entries()
                    .toArray()
                    .map(([currency, reimbursements]) => (
                      <ListWithCurrency key={currency} currency={currency}>
                        <ReimbursementList
                          group={group}
                          currency={currency}
                          reimbursements={reimbursements}
                        />
                      </ListWithCurrency>
                    ))
                )
              })()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
              <CardDescription>
                Spending summary of the entire group.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {balanceMap
                .entries()
                .toArray()
                .map(([currency, balances]) => (
                  <ListWithCurrency key={currency} currency={currency}>
                    <Totals
                      group={group}
                      currency={currency}
                      balances={balances}
                    />
                  </ListWithCurrency>
                ))}
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}
