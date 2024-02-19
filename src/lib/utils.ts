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

export function formatExpenseDate(date: Date) {
  return dayFormatter.format(date)
}

export function formatExpenseGroupDate(date: Date) {
  return monthFormatter.format(date)
}

export function isSameWeek(date: Date, now: Date) {
  const _BOUNDARY_DAY = 1 // Monday
  const _MS_PER_DAY = 1000 * 3600 * 24
  const utc1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const utc2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.floor((utc2 - utc1) / _MS_PER_DAY)
  if (diffDays > 6) return false

  const day = date.getUTCDay()
  if (day == _BOUNDARY_DAY) return true

  const today = now.getUTCDay()
  if (today == _BOUNDARY_DAY) return false

  const dayDist = (day - _BOUNDARY_DAY + 7) % 7
  const todayDist = (today - _BOUNDARY_DAY + 7) % 7
  return dayDist <= todayDist
}

export function isSameMonth(date: Date, now: Date) {
  if (date.getFullYear() != now.getFullYear()) return false
  return date.getMonth() == now.getMonth()
}

export function formatCategoryForAIPrompt(category: Category) {
  return `"${category.grouping}/${category.name}" (ID: ${category.id})`
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(currency: string, amount: number) {
  const formattedAmount = currencyFormatter.format(amount / 100)
  return currency + formattedAmount
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
