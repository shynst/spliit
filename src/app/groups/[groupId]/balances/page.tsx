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
import { APIExpenseBalance, getExpenseListByCurrency } from '@/lib/api'
import {
  Balances,
  Reimbursement,
  getBalances,
  getPublicBalances,
  getSuggestedReimbursements,
  getTotalGroupSpending,
} from '@/lib/balances'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import * as React from 'react'

// cspell:ignore doesn

export const metadata: Metadata = {
  title: 'Balances',
}

interface ExpenseBalances {
  expenses: APIExpenseBalance[]
  totalSpendings: number
  balances: Balances
  publicBalances: Balances
  reimbursements: Reimbursement[]
}

type Props = { params: { groupId: string } }
type ListWithCurrencyProps = { currency: string; children: React.ReactNode }

export default async function GroupPage({ params: { groupId } }: Props) {
  const group = await cached.getGroup(groupId)
  if (!group) notFound()

  const expensesMap = new Map<string, ExpenseBalances>()
  const currencyEx = await getExpenseListByCurrency(groupId)

  currencyEx.forEach((expenses, currency) => {
    const balances = getBalances(expenses)
    const reimbursements = getSuggestedReimbursements(balances)
    const publicBalances = getPublicBalances(reimbursements)

    expensesMap.set(currency, {
      expenses,
      totalSpendings: getTotalGroupSpending(expenses),
      balances,
      reimbursements,
      publicBalances,
    })
  })

  const expenseMapEntries = Array.from(expensesMap.entries())
  const multiCurrencies = expenseMapEntries.length > 1

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
            if (expenseMapEntries.length === 0) {
              return (
                <div className="text-sm">
                  Your group doesn&apos;t contain any expenses.
                </div>
              )
            }
            const entries = expenseMapEntries.filter(
              ([_, balances]) => balances.reimbursements.length > 0,
            )
            return entries.length > 0 ? (
              entries.map(([currency, balances]) => (
                <ListWithCurrency key={currency} currency={currency}>
                  <BalancesList
                    group={group}
                    currency={currency}
                    balances={balances.publicBalances}
                  />
                </ListWithCurrency>
              ))
            ) : (
              <div className="text-sm">All group balances are settled.</div>
            )
          })()}
        </CardContent>
      </Card>
      {expenseMapEntries.length > 0 && (
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
                const entries = expenseMapEntries.filter(
                  ([_, balances]) => balances.reimbursements.length > 0,
                )
                return entries.length > 0 ? (
                  entries.map(([currency, balances]) => (
                    <ListWithCurrency key={currency} currency={currency}>
                      <ReimbursementList
                        group={group}
                        currency={currency}
                        reimbursements={balances.reimbursements}
                      />
                    </ListWithCurrency>
                  ))
                ) : (
                  <div className="text-sm">
                    Your group doesn&apos;t need any reimbursement.
                  </div>
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
              {expenseMapEntries.map(([currency, balances]) => (
                <ListWithCurrency key={currency} currency={currency}>
                  <Totals
                    group={group}
                    expenses={balances.expenses}
                    currency={currency}
                    totalSpendings={balances.totalSpendings}
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
