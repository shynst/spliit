import { prisma } from '@/lib/prisma'

async function listExpenseSums(startDate: string, endDate: string) {
  const group_id = '5icadJQc9aZYv5Hfvrr6i'

  console.info('Listing payments between ' + startDate + ' and ' + endDate)

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

async function main() {
  await listExpenseSums('2024-01-01', '2025-01-01')
  await listExpenseSums('2025-01-01', '2026-01-01')
}

main().catch(console.error)
