import { getGroupExpenses } from '@/lib/api'
import { cn, formatExpenseDate } from '@/lib/utils'
import { Category } from '@prisma/client'
import * as lucide from 'lucide-react'

function getCategoryColor(category: Category | null) {
  switch (Math.floor((category?.id || 0) / 100)) {
    case 1: // life
      return 'bg-amber-100'
    case 2: // home
      return 'bg-lime-100'
    case 3: // entertainment
      return 'bg-rose-100'
    case 4: // traveling
      return 'bg-sky-100'
    case 5:
      return 'bg-purple-100'
    default:
      return 'bg-zinc-200'
  }
}

export function CategoryIcon({
  category,
  coloredIcon,
  ...props
}: { category: Category | null; coloredIcon?: boolean } & lucide.LucideProps) {
  const Icon: lucide.LucideIcon =
    (category && (lucide as any)[category.icon]) ?? lucide.Banknote
  return (
    <Icon
      {...props}
      className={cn(
        'w-5 h-5 stroke-1',
        coloredIcon && getCategoryColor(category),
        props.className,
      )}
    />
  )
}

export function CategoryExpenseIcon({
  expense,
}: {
  expense: Awaited<ReturnType<typeof getGroupExpenses>>[number]
}) {
  const cat = expense.category
  const catColor = getCategoryColor(cat)

  return (
    <div
      className={
        'flex flex-col justify-center items-center not-italic p-1 rounded-sm ' +
        catColor
      }
    >
      <CategoryIcon category={cat} className="mb-1" />
      <div className="text-xs mx-0.5 text-muted-foreground">
        {formatExpenseDate(expense.expenseDate)}
      </div>
    </div>
  )
}
