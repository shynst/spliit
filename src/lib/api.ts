import { prisma } from '@/lib/prisma'
import { ExpenseFormValues, GroupFormValues } from '@/lib/schemas'
import { Expense } from '@prisma/client'
import { nanoid } from 'nanoid'

export function randomId() {
  return nanoid()
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
    include: { participants: true },
  })
}

export async function createExpense(
  expenseFormValues: ExpenseFormValues,
  groupId: string,
  participantId: string | null,
): Promise<Expense> {
  const group = await getGroup(groupId)
  if (!group) throw new Error(`Invalid group ID: ${groupId}`)

  for (const participant of [
    expenseFormValues.paidBy,
    ...expenseFormValues.paidFor.map((p) => p.participant),
  ]) {
    if (!group.participants.some((p) => p.id === participant))
      throw new Error(`Invalid participant ID: ${participant}`)
  }

  return prisma.expense.create({
    data: {
      id: randomId(),
      groupId,
      createdById: participantId ?? undefined,
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
    },
  })
}

export async function deleteExpense(
  expenseId: string,
  participantId: string | null,
) {
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } })
  if (!expense) return

  expense.id = randomId()
  expense.createdById = participantId
  expense.createdAt = new Date()
  expense.nextVersionId = null
  expense.deleted = true

  await prisma.expense.create({ data: expense })
  await prisma.expense.update({
    where: { id: expenseId },
    data: { nextVersionId: expense.id, deleted: true },
  })
}

export async function getGroupExpensesParticipants(groupId: string) {
  const expenses = await getGroupExpenses(groupId)
  return Array.from(
    new Set(
      expenses.flatMap((e) => [
        e.paidBy.id,
        ...e.paidFor.map((pf) => pf.participant.id),
      ]),
    ),
  )
}

export async function getGroups(groupIds: string[]) {
  return (
    await prisma.group.findMany({
      where: { id: { in: groupIds } },
      include: { _count: { select: { participants: true } } },
    })
  ).map((group) => ({
    ...group,
    createdAt: group.createdAt.toISOString(),
  }))
}

export async function updateExpense(
  expenseId: string,
  expenseFormValues: ExpenseFormValues,
  participantId: string | null,
) {
  const groupId = (
    await prisma.expense.findUnique({ where: { id: expenseId } })
  )?.groupId
  if (!groupId) throw new Error(`Invalid expense ID: ${expenseId}`)

  const expense = await createExpense(expenseFormValues, groupId, participantId)
  await prisma.expense.update({
    where: { id: expenseId },
    data: { nextVersionId: expense.id, deleted: true },
  })

  return expense
}

export async function updateGroup(
  groupId: string,
  groupFormValues: GroupFormValues,
  participantId: string | null,
) {
  const existingGroup = await getGroup(groupId)
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
  })
  return group
}

export async function getGroup(groupId: string) {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: { participants: true },
  })
}

export async function getCategories() {
  return prisma.category.findMany()
}

export async function getGroupExpenses(
  groupId: string,
  options?: { offset?: number; length?: number; includeHistory?: boolean },
) {
  const where = options?.includeHistory
    ? { groupId }
    : { groupId, deleted: false }

  return prisma.expense.findMany({
    select: {
      id: true,
      expenseDate: true,
      title: true,
      category: true,
      amount: true,
      paidBy: { select: { id: true, name: true } },
      paidFor: {
        select: {
          participant: { select: { id: true, name: true } },
          shares: true,
        },
      },
      expenseType: true,
      splitMode: true,
      createdById: true,
      createdAt: true,
      nextVersionId: true,
      deleted: true,
    },
    where,
    orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
    skip: options?.offset,
    take: options?.length,
  })
}

export async function getGroupExpenseCount(groupId: string) {
  return prisma.expense.count({ where: { groupId, deleted: false } })
}

export async function getExpense(expenseId: string) {
  return prisma.expense.findUnique({
    where: { id: expenseId },
    include: { paidBy: true, paidFor: true, category: true, documents: true },
  })
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
