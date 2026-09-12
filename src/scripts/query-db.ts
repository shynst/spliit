import { prisma } from '@/lib/prisma'

const group_id = '5icadJQc9aZYv5Hfvrr6i'

async function listExpenseSums(startDate: string, endDate: string) {
  console.info(`\nListing payments between ${startDate} and ${endDate}\n`)

  const expenses: { category: string; sum: string }[] =
    await prisma.$queryRaw`SELECT
        Category.name AS category,
        SUM(amount * IF(expenseType='INCOME', -1, 1))/100 AS sum
      FROM Expense
        JOIN Category ON Expense.categoryId = Category.id
        WHERE groupId = ${group_id} AND expenseState='current' AND expenseType!='REIMBURSEMENT'
        AND expenseDate >= ${startDate} AND expenseDate < ${endDate}
        GROUP BY categoryId
        ORDER BY sum DESC`

  expenses.forEach(({ category, sum }) => console.info(category, Number(sum)))
  console.info(
    'Total',
    expenses.reduce((s, p) => s + Number(p.sum), 0),
  )
}

async function listExpensesForCatId(
  cat: number,
  startDate: string,
  endDate: string,
) {
  console.info(
    `\nListing payments for category ${cat} between ${startDate} and ${endDate}\n`,
  )

  const expenses: { date: Date; title: string; amount: string }[] =
    await prisma.$queryRaw`SELECT
        expenseDate AS date,
        title,
        (amount/100 * IF(expenseType='INCOME', -1, 1)) AS amount
      FROM Expense
      WHERE categoryId = ${cat} AND groupId = ${group_id} AND expenseState='current' AND expenseType!='REIMBURSEMENT'
      AND expenseDate >= ${startDate} AND expenseDate < ${endDate}
      ORDER BY expenseDate`

  expenses.forEach(({ date, title, amount }) =>
    console.info(date.toISOString().split('T')[0], title, Number(amount)),
  )
}

async function generate_immo_kosten_CSV() {
  const expenses: {
    date: Date
    immo: string
    title: string
    paidBy: string
    amount: string
  }[] = await prisma.$queryRaw`SELECT
        expenseDate AS date,
        IF(categoryId=200, 'RW', 'UL') AS immo,
        title,
        p.name AS paidBy,
        (amount/100 * IF(expenseType='INCOME', -1, 1)) AS amount
      FROM Expense e
      JOIN Participant p ON e.paidById = p.id
        WHERE categoryId IN (200,201) AND e.groupId = ${group_id} AND expenseState='current' AND expenseType!='REIMBURSEMENT'
        ORDER BY expenseDate`

  expenses
    .map(({ date, immo, title, paidBy, amount }) => [
      date.toISOString().split('T')[0],
      immo,
      title,
      paidBy === 'Johanna' ? '' : ';',
      String(amount).replace('.', ','),
    ])
    .forEach((e) => console.info(e.join(';')))
}

async function main() {
  await listExpenseSums('2024-01-01', '2025-01-01')
  // await listExpenseSums('2025-01-01', '2026-01-01')
  await listExpensesForCatId(201, '2024-01-01', '2025-01-01')
  // await generate_immo_kosten_CSV()
}

main().catch(console.error)
