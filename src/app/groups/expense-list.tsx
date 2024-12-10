'use client'

import { ExpenseCard } from '@/app/groups/[groupId]/expenses/expense-card'
import { ExpenseHistoryCard } from '@/app/groups/[groupId]/history/expense-history-card'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/ui/search-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { APIExpense, APIGroup, getExpenseList } from '@/lib/api'
import { formatExpenseGroupDate } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'

type Props = {
  group: APIGroup
  expensesFirstPage: APIExpense[]
  expenseCount: number
  includeHistory: boolean
}

function getGroupedExpensesByDate(
  expenses: APIExpense[],
  dateField: 'expenseDate' | 'createdAt',
) {
  return expenses.reduce((result: { [key: string]: APIExpense[] }, expense) => {
    const expenseGroup = formatExpenseGroupDate(expense[dateField])
    result[expenseGroup] = result[expenseGroup] ?? []
    result[expenseGroup].push(expense)
    return result
  }, {})
}

export function ExpenseList({
  group,
  expensesFirstPage,
  expenseCount,
  includeHistory,
}: Props) {
  const groupId = group.id
  const participants = group.participants
  const firstLen = expensesFirstPage.length
  const [searchText, setSearchText] = useState('')
  const [dataIndex, setDataIndex] = useState(firstLen)
  const [dataLen, setDataLen] = useState(firstLen)
  const [hasMoreData, setHasMoreData] = useState(expenseCount > firstLen)
  const [isFetching, setIsFetching] = useState(false)
  const [expenses, setExpenses] = useState(expensesFirstPage)
  const [activeUserId, setActiveUserId] = useState(null as string | null)

  const { ref, inView } = useInView()

  useEffect(() => {
    let userId = null as string | null
    const newGroupUser = localStorage.getItem('newGroup-activeUser')
    const newUser = localStorage.getItem(`${groupId}-newUser`)
    if (newGroupUser || newUser) {
      localStorage.removeItem('newGroup-activeUser')
      localStorage.removeItem(`${groupId}-newUser`)
      if (newGroupUser === 'None') {
        localStorage.setItem(`${groupId}-activeUser`, 'None')
      } else {
        userId =
          participants.find((p) => p.name === (newGroupUser || newUser))?.id ||
          null
        if (userId) {
          localStorage.setItem(`${groupId}-activeUser`, userId)
        }
      }
    } else userId = localStorage.getItem(`${groupId}-activeUser`)

    setActiveUserId(userId)
  }, [participants, groupId])

  useEffect(() => {
    const fetchNextPage = async () => {
      setIsFetching(true)

      const newExpenses = await getExpenseList(groupId, {
        offset: dataIndex,
        length: dataLen,
        includeHistory,
      })

      if (newExpenses !== null) {
        const exp = expenses.concat(newExpenses)
        setExpenses(exp)
        setHasMoreData(exp.length < expenseCount)
        setDataIndex(dataIndex + dataLen)
        setDataLen(Math.ceil(1.5 * dataLen))
      }

      setTimeout(() => setIsFetching(false), 500)
    }

    if (inView && hasMoreData && !isFetching) fetchNextPage()
  }, [
    dataIndex,
    dataLen,
    expenseCount,
    expenses,
    groupId,
    hasMoreData,
    inView,
    includeHistory,
    isFetching,
  ])

  const groupedExpensesByDate = useMemo(
    () =>
      getGroupedExpensesByDate(
        expenses,
        includeHistory ? 'createdAt' : 'expenseDate',
      ),
    [expenses, includeHistory],
  )

  return expenses.length > 0 ? (
    <>
      <SearchBar onValueChange={(value) => setSearchText(value)} />
      {Object.entries(groupedExpensesByDate).map(([expGroup, exp]) => {
        exp = exp.filter(({ title }) =>
          title.toLowerCase().includes(searchText.toLowerCase()),
        )
        if (exp.length === 0) return null

        return (
          <div key={expGroup}>
            <div
              className={
                'text-muted-foreground text-xs pl-4 sm:pl-6 py-1 font-semibold sticky top-12 sm:top-16 bg-white dark:bg-[#1b1917]'
              }
            >
              {expGroup}
            </div>
            {exp.map((expense) =>
              includeHistory ? (
                <ExpenseHistoryCard
                  key={expense.id}
                  expense={expense}
                  group={group}
                  activeUserId={activeUserId}
                />
              ) : (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  group={group}
                  activeUserId={activeUserId}
                  numMembers={participants.length}
                />
              ),
            )}
          </div>
        )
      })}
      {expenses.length < expenseCount &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            className="border-t flex justify-between items-center px-6 py-4 text-sm"
            ref={i === 0 ? ref : undefined}
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        ))}
    </>
  ) : (
    <p className="px-6 text-sm py-6">
      Your group doesn’t contain any expense yet.{' '}
      <Button variant="link" asChild className="-m-4">
        <Link href={`/groups/${groupId}/expenses/create`}>
          Create the first one
        </Link>
      </Button>
    </p>
  )
}
