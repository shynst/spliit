'use server'

import { cached } from '@/app/cached-functions'
import { prisma } from '@/lib/prisma'
import { ExpenseFormValues, GroupFormValues } from '@/lib/schemas'
import { nanoid as randomId } from 'nanoid'

export type APIGroup = Awaited<ReturnType<typeof createGroup>>
export type APIExpense = Awaited<ReturnType<typeof createExpense>> & {
  prevVersion?: APIExpense | null | undefined
  createdBy?: { name: string } | null | undefined
}

export { randomId }

const groupIncludeParams = {
  participants: { select: { id: true, name: true } },
}
const expenseIncludeParams = {
  paidBy: { select: { id: true, name: true } },
  paidFor: {
    select: {
      participant: { select: { id: true, name: true } },
      shares: true,
    },
  },
  category: { select: { id: true, icon: true } },
}

export async function createGroup(groupFormValues: GroupFormValues) {
  return prisma.group.create({
    data: {
      id: randomId(),
      name: groupFormValues.name,
      currency: groupFormValues.currency,
      participants: {
        createMany: {
          data: groupFormValues.participants.map(({ name }) => ({
            id: randomId(),
            name,
          })),
        },
      },
    },
    include: groupIncludeParams,
  })
}

export async function updateGroup(
  groupId: string,
  groupFormValues: GroupFormValues,
): Promise<APIGroup> {
  const existingGroup = await cached.getGroup(groupId)
  if (!existingGroup) throw new Error('Invalid group ID')

  const group = await prisma.group.update({
    where: { id: groupId },
    data: {
      name: groupFormValues.name,
      currency: groupFormValues.currency,
      participants: {
        deleteMany: existingGroup.participants.filter(
          (p) => !groupFormValues.participants.some((p2) => p2.id === p.id),
        ),
        updateMany: groupFormValues.participants
          .filter((participant) => participant.id !== undefined)
          .map((participant) => ({
            where: { id: participant.id },
            data: {
              name: participant.name,
            },
          })),
        createMany: {
          data: groupFormValues.participants
            .filter((participant) => participant.id === undefined)
            .map((participant) => ({
              id: randomId(),
              name: participant.name,
            })),
        },
      },
    },
    include: groupIncludeParams,
  })
  return group
}

export async function getGroupsDetails(groupIds: string[]) {
  return (
    await prisma.group.findMany({
      where: { id: { in: groupIds } },
      select: {
        id: true,
        createdAt: true,
        _count: { select: { participants: true } },
      },
    })
  ).map((group) => ({
    id: group.id,
    participantCount: group._count.participants,
    createdAt: group.createdAt.toISOString(),
  }))
}

export async function getGroup(groupId: string): Promise<APIGroup | null> {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: groupIncludeParams,
  })
}

async function getCreateExpenseParams(
  expenseFormValues: ExpenseFormValues,
  groupId: string,
  createdById: string | null,
) {
  const group = await cached.getGroup(groupId)
  if (!group) throw new Error(`Invalid group ID: ${groupId}`)

  for (const participant of [
    createdById,
    expenseFormValues.paidBy,
    ...expenseFormValues.paidFor.map((p) => p.participant),
  ]) {
    if (!group.participants.some((p) => p.id === participant))
      throw new Error(`Invalid participant ID: ${participant}`)
  }

  return {
    data: {
      id: randomId(),
      groupId,
      createdById,
      expenseDate: expenseFormValues.expenseDate,
      categoryId: expenseFormValues.category,
      amount: expenseFormValues.amount,
      title: expenseFormValues.title,
      paidById: expenseFormValues.paidBy,
      splitMode: expenseFormValues.splitMode,
      paidFor: {
        createMany: {
          data: expenseFormValues.paidFor.map((paidFor) => ({
            participantId: paidFor.participant,
            shares: paidFor.shares,
          })),
        },
      },
      expenseType: expenseFormValues.expenseType,
      documents: {
        createMany: {
          data: expenseFormValues.documents.map((doc) => ({
            id: randomId(),
            url: doc.url,
            width: doc.width,
            height: doc.height,
          })),
        },
      },
      notes: expenseFormValues.notes,
      prevVersionId: null as string | null,
    },
    include: expenseIncludeParams,
  }
}

export async function createExpense(
  expenseFormValues: ExpenseFormValues,
  groupId: string,
  createdById: string | null,
) {
  return prisma.expense.create(
    await getCreateExpenseParams(expenseFormValues, groupId, createdById),
  )
}

export async function updateExpense(
  expenseFormValues: ExpenseFormValues,
  expenseId: string,
  groupId: string,
  updatedById: string | null,
): Promise<APIExpense> {
  const params = await getCreateExpenseParams(
    expenseFormValues,
    groupId,
    updatedById,
  )
  params.data.prevVersionId = expenseId

  try {
    const [_, expense] = await prisma.$transaction([
      prisma.expense.update({
        where: { id: expenseId },
        data: { deleted: true },
      }),
      prisma.expense.create(params),
    ])
    return expense
  } catch {
    throw new Error(`Failed to update expense: ${expenseId}`)
  }
}

export async function deleteExpense(
  expenseId: string,
  deletedById: string | null,
) {
  try {
    await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.update({
        where: { id: expenseId },
        data: { deleted: true },
      })
      tx.expense.create({
        data: {
          ...expense,
          id: randomId(),
          createdById: deletedById,
          createdAt: new Date(),
          prevVersionId: expenseId,
          deleted: true,
        },
      })
    })
  } catch {
    throw new Error(`Failed to delete expense: ${expenseId}`)
  }
}

export async function getExpenseList(
  groupId: string,
  options?: { offset?: number; length?: number; includeHistory?: boolean },
): Promise<APIExpense[]> {
  const where = options?.includeHistory
    ? { groupId }
    : { groupId, deleted: false }

  const include = options?.includeHistory
    ? {
        ...expenseIncludeParams,
        prevVersion: true,
        createdBy: { select: { name: true } },
      }
    : expenseIncludeParams

  const sortE = { expenseDate: 'desc' } as const
  const sortC = { createdAt: 'desc' } as const

  return prisma.expense.findMany({
    where,
    include,
    orderBy: options?.includeHistory ? [sortC] : [sortE, sortC],
    skip: options?.offset,
    take: options?.length,
  })
}

export async function getExpenseCount(
  groupId: string,
  options?: { includeHistory?: boolean },
) {
  const where = options?.includeHistory
    ? { groupId }
    : { groupId, deleted: false }
  return prisma.expense.count({ where })
}

export async function getExpense(
  expenseId: string,
  options?: { includeHistory: boolean },
): Promise<APIExpense | null> {
  const expense: APIExpense | null = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: expenseIncludeParams,
  })

  // if we want to include the history, we need to link all previous versions (recursively!)
  if (options?.includeHistory) {
    const prevVersionId = expense?.prevVersionId
    if (prevVersionId)
      expense.prevVersion = await getExpense(prevVersionId, options)
  }

  return expense
}

export async function getExpensesParticipants(groupId: string) {
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    select: {
      paidBy: { select: { id: true } },
      paidFor: { select: { participantId: true } },
    },
  })
  return Array.from(
    new Set(
      expenses.flatMap((e) => [
        e.paidBy.id,
        ...e.paidFor.map((pf) => pf.participantId),
      ]),
    ),
  )
}

export async function getCategories() {
  return prisma.category.findMany()
}

/*
async function logChangeXX(
  oldExpense: Expense | null,
  newExpense: Expense | null,
  modifiedById: string | null,
) {
  if (!oldExpense && !newExpense) return
  const groupId = oldExpense?.groupId ?? newExpense!.groupId
  const currency =
    (
      await prisma.group.findUnique({
        where: { id: groupId },
      })
    )?.currency ?? '$'

  const getExpenseObject = async (expense: Expense | null) => {
    const id = expense?.id
    const e =
      id &&
      (await prisma.expense.findUnique({
        where: { id },
        select: {
          expenseDate: true,
          title: true,
          amount: true,
          paidBy: { select: { name: true } },
          paidFor: {
            select: { shares: true, participant: { select: { name: true } } },
          },
          expenseType: true,
          splitMode: true,
          notes: true,
        },
      }))
    if (!e) return undefined

    const unEvenly = e.splitMode !== 'EVENLY'
    return {
      ...e,
      currency,
      paidBy: e.paidBy.name,
      paidFor: e.paidFor.map((pf) => ({
        participant: pf.participant.name,
        shares: unEvenly ? pf.shares : null,
      })),
      splitMode: unEvenly,
    }
  }

  const oldE = oldExpense && (await getExpenseObject(oldExpense.id))
  const newE = newExpense && (await getExpenseObject(newExpense.id))

  const modifiedBy =
    (modifiedById &&
      (await prisma.participant.findUnique({ where: { id: modifiedById } }))
        ?.name) ??
    'unknown'

  const logE = (
    e: NonNullable<Awaited<ReturnType<typeof getExpenseObject>>>,
  ) => {
    const amount = formatCurrency(currency, e.amount)
    const paidFor =
      e.expenseType === 'EXPENSE'
        ? 'paid ' + amount + ' for'
        : e.expenseType === 'INCOME'
        ? 'received ' + amount + ' for'
        : 'refunded ' + amount + ' to'
    const recipients = e.paidFor
      .map((pf) => pf.participant)
      .join(', ')
      .replace(/,([^,]*)$/, ' and$1')

    console.log(
      `${formatDate(new Date())} [${modifiedBy}]: Created "${e.title}": ${
        e.paidBy
      } ${paidFor} ${recipients}`,
    )
  }

  if (newE) logE(newE)

  const expenseId = oldExpense?.id ?? newExpense!.id

  const data = {
    groupId,
    expenseId,
    modifiedById,
    modifiedFrom: await getExpenseObject(oldExpense),
    modifiedTo: await getExpenseObject(newExpense),
  }
  console.log(data.modifiedFrom, data.modifiedTo)

  // return prisma.expenseModification.create({ data })
}
*/
