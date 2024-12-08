import { ActivityItem } from '@/app/groups/[groupId]/activity/activity-item'
import { getGroupExpenses } from '@/lib/api'
import { formatExpenseGroupDate } from '@/lib/utils'
import { Participant } from '@prisma/client'

type ExpenseVersions = Awaited<ReturnType<typeof getGroupExpenses>>

type Props = {
  groupId: string
  participants: Participant[]
  expenseVersions: ExpenseVersions
}

function getGroupedChangesByDate(expenseVersions: ExpenseVersions) {
  return expenseVersions.reduce(
    (result: { [key: string]: ExpenseVersions }, change) => {
      const changeGroup = formatExpenseGroupDate(change.createdAt)
      result[changeGroup] = result[changeGroup] ?? []
      result[changeGroup].push(change)
      return result
    },
    {},
  )
}

export function ActivityList({
  groupId,
  participants,
  expenseVersions,
}: Props) {
  const groupedChangesByDate = getGroupedChangesByDate(expenseVersions)

  return expenseVersions.length > 0 ? (
    <>
      {Object.entries(groupedChangesByDate).map(([modGroup, mod]) => {
        if (mod.length === 0) return null

        return (
          <div key={modGroup}>
            <div
              className={
                'text-muted-foreground text-xs py-1 font-semibold sticky top-16 bg-white dark:bg-[#1b1917]'
              }
            >
              {modGroup}
            </div>
            {mod.map((version) => {
              const participant =
                version.createdById !== null
                  ? participants.find((p) => p.id === version.createdById)
                  : undefined
              return (
                <ActivityItem
                  key={version.id}
                  groupId={groupId}
                  participant={participant}
                  expenseVersion={version}
                />
              )
            })}
          </div>
        )
      })}
    </>
  ) : (
    <p className="px-6 text-sm py-6">
      There is not yet any activity in your group.
    </p>
  )
}
