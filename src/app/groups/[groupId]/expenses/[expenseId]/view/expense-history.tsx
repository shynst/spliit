'use client'

import { ExpenseList } from '@/app/groups/expense-list'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { APIExpense, APIGroup } from '@/lib/api'
import { useState } from 'react'

export function ExpenseHistory({
  group,
  expense,
  history,
}: {
  group: APIGroup
  expense: APIExpense
  history: APIExpense[]
}) {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <Collapsible className="group" open={showHistory}>
      <Button
        variant="link"
        className="pl-6 pb-6 before:content-['Show'] group-[[data-state=open]]:before:content-['Hide']"
        onClick={(e) => {
          e.preventDefault()
          setShowHistory(!showHistory)
        }}
      >
        {'\u00A0history…'}
      </Button>
      <CollapsibleContent>
        {' '}
        <ExpenseList
          group={group}
          preloadedExpenses={history}
          expenseCount={history.length}
          style="history"
          selectedExpenseId={expense.id}
        />
      </CollapsibleContent>
    </Collapsible>
  )
}