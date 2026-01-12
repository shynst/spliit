import { cached } from '@/app/cached-functions'
import { GroupForm } from '@/components/group-form'
import { getExpensesParticipants, updateGroup } from '@/lib/api'
import { groupFormSchema } from '@/lib/schemas'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function EditGroupPage(props: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await props.params

  const group = await cached.getGroup(groupId)
  if (!group) notFound()

  async function updateGroupAction(values: unknown) {
    'use server'
    const groupFormValues = groupFormSchema.parse(values)
    const group = await updateGroup(groupId, groupFormValues)
    redirect(`/groups/${group.id}`)
  }

  const protectedParticipantIds = await getExpensesParticipants(groupId)
  return (
    <GroupForm
      group={group}
      onSubmit={updateGroupAction}
      protectedParticipantIds={protectedParticipantIds}
    />
  )
}
