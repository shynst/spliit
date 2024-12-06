import { ActivityItem } from '@/app/groups/[groupId]/activity/activity-item'
import { getActivities, getGroupExpenses } from '@/lib/api'
import { formatExpenseGroupDate } from '@/lib/utils'
import { Activity, Participant } from '@prisma/client'

type ActivitiesType = NonNullable<Awaited<ReturnType<typeof getActivities>>>

type Props = {
  groupId: string
  participants: Participant[]
  expenses: Awaited<ReturnType<typeof getGroupExpenses>>
  activities: Activity[]
}

function getGroupedActivitiesByDate(activities: ActivitiesType) {
  return activities.reduce(
    (result: { [key: string]: ActivitiesType }, activity) => {
      const activityGroup = formatExpenseGroupDate(activity.time)
      result[activityGroup] = result[activityGroup] ?? []
      result[activityGroup].push(activity)
      return result
    },
    {},
  )
}

export function ActivityList({
  groupId,
  participants,
  expenses,
  activities,
}: Props) {
  const groupedActivitiesByDate = getGroupedActivitiesByDate(activities)

  return activities.length > 0 ? (
    <>
      {Object.entries(groupedActivitiesByDate).map(([actGroup, act]) => {
        if (act.length === 0) return null

        return (
          <div key={actGroup}>
            <div
              className={
                'text-muted-foreground text-xs py-1 font-semibold sticky top-16 bg-white dark:bg-[#1b1917]'
              }
            >
              {actGroup}
            </div>
            {act.map((activity: Activity) => {
              const participant =
                activity.participantId !== null
                  ? participants.find((p) => p.id === activity.participantId)
                  : undefined
              const expense =
                activity.expenseId !== null
                  ? expenses.find((e) => e.id === activity.expenseId)
                  : undefined
              return (
                <ActivityItem
                  key={activity.id}
                  {...{
                    groupId,
                    activity,
                    participant,
                    expense,
                    dateStyle: undefined,
                  }}
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
