'use server'

import { cached } from '@/app/cached-functions'
import { prisma } from '@/lib/prisma'
import { ExpenseFormValues, GroupFormValues } from '@/lib/schemas'
import equal from 'fast-deep-equal'
import { nanoid as randomId } from 'nanoid'

export type APIGroup = Awaited<ReturnType<typeof createGroup>>
export type APIExpense = Awaited<ReturnType<typeof createExpense>> & {
  prevVersion?: APIExpense | null | undefined
  nextVersion?: APIExpense | null | undefined
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
  category: { select: { id: true, name: true, icon: true } },
}

export async function createGroup(groupFormValues: GroupFormValues) {
  return prisma.group.create({
    data: {
      id: randomId(),
      name: groupFormValues.name,
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

export async function getUsedCurrencies(groupId: string): Promise<string[]> {
  return (
    await prisma.expense.findMany({
      select: { currency: true },
      distinct: 'currency',
      where: { groupId, expenseState: 'CURRENT' },
      orderBy: { currency: 'asc' },
    })
  ).map((e) => e.currency)
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
      currency: expenseFormValues.currency,
      title: expenseFormValues.title.trim(),
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
      notes: expenseFormValues.notes || null,
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
  const createParams = await getCreateExpenseParams(
    expenseFormValues,
    groupId,
    updatedById,
  )
  createParams.data.prevVersionId = expenseId

  const normalize = (
    expense:
      Awaited<ReturnType<typeof getCreateExpenseParams>>['data'] | APIExpense,
  ) =>
    expense && {
      ...expense,
      id: undefined,
      createdById: undefined,
      createdAt: undefined,
      paidBy: undefined,
      categoryId: -1,
      category: undefined,
      expenseState: undefined,
      prevVersionId: undefined,
      paidFor: (Array.isArray(expense.paidFor)
        ? expense.paidFor.map((pf) => ({
            participantId: pf.participant.id,
            shares: pf.shares,
          }))
        : expense.paidFor.createMany.data
      ).sort((a, b) => a.participantId.localeCompare(b.participantId)),
    }

  try {
    return prisma.$transaction(async (tx) => {
      const currExp = await tx.expense.findUnique({
        where: { id: expenseId },
        include: expenseIncludeParams,
      })
      if (!currExp) throw new Error(`Invalid expense ID: ${expenseId}`)

      if (equal(normalize(currExp), normalize(createParams.data))) {
        // trivial change: only category changed
        //   do not create a new version, just update the category
        if (currExp.categoryId !== createParams.data.categoryId) {
          await tx.expense.update({
            where: { id: expenseId },
            data: { categoryId: createParams.data.categoryId },
          })
          currExp.categoryId = createParams.data.categoryId
        }
        return currExp
      }

      await tx.expense.update({
        where: { id: expenseId },
        data: { expenseState: 'MODIFIED' },
      })

      return tx.expense.create(createParams)
    })
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
        data: { expenseState: 'MODIFIED' },
      })
      await tx.expense.create({
        data: {
          ...expense,
          id: randomId(),
          createdById: deletedById,
          createdAt: new Date(),
          prevVersionId: expenseId,
          expenseState: 'DELETED',
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
  const { offset, length, includeHistory = false } = options || {}

  const where = includeHistory
    ? { groupId }
    : ({ groupId, expenseState: 'CURRENT' } as const)

  const include = includeHistory
    ? {
        ...expenseIncludeParams,
        prevVersion: { include: expenseIncludeParams },
        createdBy: { select: { name: true } },
      }
    : expenseIncludeParams

  const sortE = { expenseDate: 'desc' } as const
  const sortC = { createdAt: 'desc' } as const

  return prisma.expense.findMany({
    where,
    include,
    orderBy: includeHistory ? [sortC] : [sortE, sortC],
    skip: offset,
    take: length,
  })
}

export async function getExpenseCount(
  groupId: string,
  options?: { includeHistory?: boolean },
) {
  const where = options?.includeHistory
    ? { groupId }
    : ({ groupId, expenseState: 'CURRENT' } as const)
  return prisma.expense.count({ where })
}

export async function getExpense(
  expenseId: string,
  options?: { includeHistory: boolean },
): Promise<APIExpense | null> {
  let expense: APIExpense | null = null

  try {
    await prisma.$transaction(async (tx) => {
      const include = options?.includeHistory
        ? { ...expenseIncludeParams, createdBy: { select: { name: true } } }
        : expenseIncludeParams

      const get = (key: 'id' | 'prevVersionId', id: string) =>
        tx.expense.findUnique({ where: { [key]: id } as never, include })

      expense = await get('id', expenseId)

      if (expense && options?.includeHistory) {
        const getBackwardHistory = async (exp: APIExpense) => {
          const prev = exp.prevVersionId
            ? await get('id', exp.prevVersionId)
            : null
          exp.prevVersion = prev
          if (prev) await getBackwardHistory(prev)
        }

        const getForwardHistory = async (exp: APIExpense) => {
          const next: APIExpense | null = await get('prevVersionId', exp.id)
          exp.nextVersion = next
          if (next) {
            next.prevVersion = exp
            await getForwardHistory(next)
          }
        }

        await getBackwardHistory(expense)
        await getForwardHistory(expense)
      }
    })
  } catch {
    /* ignored */
  }

  return expense
}

export async function getExpensesParticipants(groupId: string) {
  let q: { id: string }[] =
    await prisma.$queryRaw`SELECT DISTINCT paidById AS id FROM Expense WHERE groupId = ${groupId}`
  const ids = q.map((x) => x.id)

  q =
    await prisma.$queryRaw`SELECT DISTINCT participantId AS id FROM ExpensePaidFor epf
              JOIN Expense e ON epf.expenseId = e.id
              WHERE groupId = ${groupId}`
  ids.push(...q.map((x) => x.id))

  return Array.from(new Set(ids))
}

export interface UserBalance {
  groupAmount: number
  paidBy: number
  paidFor: number
}
export type Balances = Map<string, UserBalance>

export async function getBalancesByCurrency(groupId: string) {
  const balances = new Map<string, Balances>()

  const addPayments = async (
    k: keyof UserBalance,
    payments: Promise<
      {
        id: string
        currency: string
        sum: number
      }[]
    >,
  ) =>
    (await payments).forEach(({ id, currency, sum }) => {
      const b = balances.get(currency) ?? new Map()
      const p = b.get(id) ?? { groupAmount: 0, paidBy: 0, paidFor: 0 }
      p[k] += Number(sum)
      if (k === 'paidBy') p.groupAmount = p[k]
      balances.set(currency, b.set(id, p))
    })

  // add payments to paidBy and groupAmount
  await addPayments(
    'paidBy',
    prisma.$queryRaw`SELECT paidById AS id, currency, SUM(amount * IF(expenseType='INCOME', -1, 1)) AS sum
        FROM Expense
        WHERE Expense.groupId = ${groupId} AND expenseState='CURRENT'
        GROUP BY currency, paidById`,
  )

  // add payments to paidFor
  await addPayments(
    'paidFor',
    prisma.$queryRaw`SELECT id, currency, IF(total_shares > 0, SUM(amount * shares / total_shares), 0) AS sum
        FROM (
            SELECT
                participantId AS id,
                IF(expenseType='INCOME', -amount, amount) AS amount,
                currency,
                IF(splitMode = 'EVENLY', 1, shares) AS shares,
                IF(splitMode = 'EVENLY',
                  COUNT(shares) OVER (PARTITION BY expenseId),
                  SUM(shares) OVER (PARTITION BY expenseId)
                ) AS total_shares
            FROM ExpensePaidFor epf
            JOIN Expense e ON epf.expenseId = e.id
            WHERE groupId = ${groupId} AND expenseState = 'CURRENT'
        ) x
        GROUP BY id, currency`,
  )

  // subtract reimbursements from groupAmount
  await addPayments(
    'groupAmount',
    prisma.$queryRaw`SELECT id, currency, IF(total_shares > 0, -SUM(amount * shares / total_shares), 0) AS sum
        FROM (
            SELECT
                participantId AS id,
                IF(expenseType='INCOME', -amount, amount) AS amount,
                currency,
                IF(splitMode = 'EVENLY', 1, shares) AS shares,
                IF(splitMode = 'EVENLY',
                  COUNT(shares) OVER (PARTITION BY expenseId),
                  SUM(shares) OVER (PARTITION BY expenseId)
                ) AS total_shares
            FROM ExpensePaidFor epf
            JOIN Expense e ON epf.expenseId = e.id
            WHERE groupId = ${groupId} AND expenseState = 'CURRENT' AND expenseType = 'REIMBURSEMENT'
        ) x
        GROUP BY id, currency`,
  )

  return balances
}

export async function getCategories() {
  return prisma.category.findMany()
}
