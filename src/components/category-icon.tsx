import { APIExpense } from '@/lib/api'
import { cn, formatExpenseDate } from '@/lib/utils'
import { Category } from '@prisma/client'
import * as lucide from 'lucide-react'
import { HTMLAttributes } from 'react'

type CatIcon = Pick<Category, 'id' | 'icon'>

function getCategoryColor(id: number | undefined) {
  switch (Math.floor((id || 0) / 100)) {
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
}: { category: CatIcon | null; coloredIcon?: boolean } & lucide.LucideProps) {
  const Icon: lucide.LucideIcon =
    (category &&
      (lucide[category.icon as keyof typeof lucide] as lucide.LucideIcon)) ??
    lucide.Banknote
  return (
    <Icon
      {...props}
      strokeWidth={1}
      color="black"
      className={cn(
        'w-5 h-5',
        coloredIcon && getCategoryColor(category?.id),
        props.className,
      )}
    />
  )
}

export function CategoryExpenseIcon({
  expense,
  textClassName,
  ...props
}: {
  expense: APIExpense
  textClassName?: string
} & HTMLAttributes<HTMLDivElement>) {
  const cat = expense.category
  const catColor = getCategoryColor(cat?.id)

  return (
    <div
      className={cn(
        'flex flex-col justify-center items-center not-italic p-1 rounded-sm',
        catColor,
        props.className,
      )}
    >
      <CategoryIcon category={cat} className="mb-1" />
      <div
        className={cn(
          'text-xs mx-0.5 text-muted-foreground dark:text-black',
          textClassName,
        )}
      >
        {formatExpenseDate(expense.expenseDate)}
      </div>
    </div>
  )
}
