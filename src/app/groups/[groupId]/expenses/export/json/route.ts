import { prisma } from '@/lib/prisma'
import contentDisposition from 'content-disposition'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  props: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await props.params

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      expenses: {
        select: {
          expenseDate: true,
          title: true,
          category: { select: { grouping: true, name: true } },
          amount: true,
          currency: true,
          paidById: true,
          paidFor: { select: { participantId: true, shares: true } },
          expenseType: true,
          splitMode: true,
        },
      },
      participants: { select: { id: true, name: true } },
    },
  })
  if (!group)
    return NextResponse.json({ error: 'Invalid group ID' }, { status: 404 })

  const date = new Date().toISOString().split('T')[0]
  const filename = `Spliit Export - ${date}`
  return NextResponse.json(group, {
    headers: {
      'content-type': 'application/json',
      'content-disposition': contentDisposition(`${filename}.json`),
    },
  })
}
