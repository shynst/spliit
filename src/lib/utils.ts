import { Category } from '@prisma/client'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
})
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat('en-UK', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export function formatDate(date: Date) {
  return timeFormatter.format(date)
}

export function formatExpenseDate(date: Date) {
  return dayFormatter.format(date)
}

export function formatExpenseGroupDate(date: Date) {
  const BOUNDARY_DAY = 1 // Monday
  const MS_PER_DAY = 1000 * 3600 * 24

  const now = new Date()
  const [year, month] = [date.getFullYear(), date.getMonth()]
  const [yearNow, monthNow] = [now.getFullYear(), now.getMonth()]

  const utc = Date.UTC(year, month, date.getDate())
  const utcNow = Date.UTC(yearNow, monthNow, now.getDate())
  if (utc > utcNow) return 'Upcoming'

  const diffDays = Math.floor((utcNow - utc) / MS_PER_DAY)
  if (diffDays <= 6) {
    const day = date.getUTCDay()
    const today = now.getUTCDay()
    if (day == today) return 'Today'

    if (day == BOUNDARY_DAY) return 'This week'

    if (today != BOUNDARY_DAY) {
      const dayDist = (day - BOUNDARY_DAY + 7) % 7
      const todayDist = (today - BOUNDARY_DAY + 7) % 7
      if (dayDist <= todayDist) return 'This week'
    }
  }

  if (year == yearNow && month == monthNow) return 'This month'

  return monthFormatter.format(date)
}

export function formatCategoryForAIPrompt(category: Category) {
  return `"${category.grouping}/${category.name}" (ID: ${category.id})`
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(currency: string, amount: number) {
  const sign = amount < 0 ? '-' : ''
  const formattedAmount = currencyFormatter.format(Math.abs(amount) / 100)
  return sign + currency + formattedAmount
}

export function formatFileSize(size: number) {
  const formatNumber = (num: number) =>
    num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })

  if (size > 1024 ** 3) return `${formatNumber(size / 1024 ** 3)} GB`
  if (size > 1024 ** 2) return `${formatNumber(size / 1024 ** 2)} MB`
  if (size > 1024) return `${formatNumber(size / 1024)} kB`
  return `${formatNumber(size)} B`
}

export function normalizeString(input: string): string {
  // Replaces special characters
  // Input: áäåèéę
  // Output: aaaeee
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
