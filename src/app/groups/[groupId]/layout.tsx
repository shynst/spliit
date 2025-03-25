import { cached } from '@/app/cached-functions'
import { GroupTabs } from '@/app/groups/[groupId]/group-tabs'
import { SaveGroupLocally } from '@/app/groups/[groupId]/save-recent-group'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PropsWithChildren, Suspense } from 'react'

type Props = {
  params: Promise<{
    groupId: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { groupId } = await props.params

  const group = await cached.getGroup(groupId)

  return {
    title: {
      default: group?.name ?? '',
      template: `%s · ${group?.name} · Spliit`,
    },
  }
}

export default async function GroupLayout(props: PropsWithChildren<Props>) {
  const { groupId } = await props.params
  const { children } = props

  const group = await cached.getGroup(groupId)
  if (!group) notFound()

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h1 className="font-bold text-2xl">
          <Link href={`/groups/${groupId}`}>{group.name}</Link>
        </h1>

        <Suspense>
          <GroupTabs groupId={groupId} />
        </Suspense>
      </div>

      {children}

      <SaveGroupLocally group={{ id: group.id, name: group.name }} />
    </>
  )
}
