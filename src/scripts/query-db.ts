import { prisma } from '@/lib/prisma'

const group_id = '5icadJQc9aZYv5Hfvrr6i'

async function listExpenseSums(startDate: string, endDate: string) {
  console.info(`\nListing payments between ${startDate} and ${endDate}\n`)

  const getPayments = async (expenseType: 'expense' | 'income') => {
    const res: { name: string; sum: string | number }[] =
      await prisma.$queryRaw`SELECT Category.name AS name, SUM(amount)/100 AS sum FROM Expense
        JOIN Category ON Expense.categoryId = Category.id
        WHERE groupId = ${group_id} AND expenseState='current' AND expenseType=${expenseType}
        AND expenseDate >= ${startDate} AND expenseDate < ${endDate}
        GROUP BY categoryId`
    return res.map(({ name, sum }) => ({ name, sum: Number(sum) }))
  }

  const expenses = await getPayments('expense')
  const income = await getPayments('income')

  let total = 0
  const payments: Record<string, number> = {}
  for (const { name, sum } of expenses) {
    const incomeSum = income.find((i) => i.name === name)?.sum || 0
    const s = sum - incomeSum
    total += s
    payments[name.replaceAll(' ', '_')] = s
  }
  payments['Total'] = total
  console.info(payments)
}

async function listExpensesForCatId(
  cat: number,
  startDate: string,
  endDate: string,
) {
  console.info(
    `\nListing payments for category ${cat} between ${startDate} and ${endDate}\n`,
  )

  const getPayments = async (expenseType: 'expense' | 'income') => {
    const res: { date: Date; title: string; cost: string | number }[] =
      await prisma.$queryRaw`SELECT expenseDate AS date, title, amount/100 AS cost FROM Expense
        WHERE categoryId = ${cat} AND groupId = ${group_id} AND expenseState='current' AND expenseType=${expenseType}
        AND expenseDate >= ${startDate} AND expenseDate < ${endDate}
        ORDER BY cost DESC`
    return res.map(({ date, title, cost }) => ({
      title:
        String(date.getDate()).padStart(2, '0') +
        '.' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '. ' +
        title,
      cost: Number(cost) * (expenseType === 'expense' ? 1 : -1),
    }))
  }

  const expenses = await getPayments('expense')
  const income = await getPayments('income')
  for (const i of income.reverse()) expenses.push(i)

  for (const { title, cost } of expenses) console.info(title, cost)
}

async function main() {
  await listExpenseSums('2024-01-01', '2025-01-01')
  // await listExpenseSums('2025-01-01', '2026-01-01')
  await listExpensesForCatId(201, '2024-01-01', '2025-01-01')
}

main().catch(console.error)
