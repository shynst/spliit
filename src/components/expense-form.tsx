'use client'
import { CategorySelector } from '@/components/category-selector'
import { ExpenseDocumentsInput } from '@/components/expense-documents-input'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import {
  CardHeader as CHeader,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  FormDescription as FDescription,
  FormLabel as FLabel,
  FormMessage as FMessage,
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCategories, getExpense, getGroup, randomId } from '@/lib/api'
import { RuntimeFeatureFlags } from '@/lib/featureFlags'
import { ExpenseFormValues, expenseFormSchema } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { DeletePopup } from './delete-popup'
import { extractCategoryFromTitle } from './expense-form-actions'
import { Textarea } from './ui/textarea'

export type Props = {
  group: NonNullable<Awaited<ReturnType<typeof getGroup>>>
  expense?: NonNullable<Awaited<ReturnType<typeof getExpense>>>
  categories: NonNullable<Awaited<ReturnType<typeof getCategories>>>
  onSubmit: (values: ExpenseFormValues) => Promise<void>
  onDelete?: () => Promise<void>
  runtimeFeatureFlags: RuntimeFeatureFlags
}

const enforceCurrencyPattern = (value: string) =>
  value
    // replace first comma with #
    .replace(/[.,]/, '#')
    // remove all other commas
    .replace(/[.,]/g, '')
    // change back # to dot
    .replace(/#/, '.')
    // remove all non-numeric and non-dot characters
    .replace(/[^\d.]/g, '')

const MarkDirty = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true,
} as const

export function ExpenseForm({
  group,
  expense,
  categories,
  onSubmit,
  onDelete,
  runtimeFeatureFlags,
}: Props) {
  const isCreate = expense === undefined
  const searchParams = useSearchParams()
  const getSelectedPayer = (field?: { value: string }) => {
    if (isCreate && typeof window !== 'undefined') {
      const activeUser = localStorage.getItem(`${group.id}-activeUser`)
      if (activeUser && activeUser !== 'None') {
        return activeUser
      }
    }
    return field?.value
  }
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: expense
      ? {
          title: expense.title,
          expenseDate: expense.expenseDate ?? new Date(),
          amount: String(expense.amount / 100) as unknown as number, // hack
          category: expense.categoryId,
          paidBy: expense.paidById,
          paidFor: expense.paidFor.map(({ participantId, shares }) => ({
            participant: participantId,
            shares: String(shares / 100) as unknown as number,
          })),
          splitMode: expense.splitMode,
          expenseType: expense.expenseType,
          documents: expense.documents,
          notes: expense.notes || undefined,
        }
      : searchParams.get('reimbursement')
      ? {
          title: 'Reimbursement',
          expenseDate: new Date(),
          amount: String(
            (Number(searchParams.get('amount')) || 0) / 100,
          ) as unknown as number, // hack
          category: 1, // category with Id 1 is Payment
          paidBy: searchParams.get('from') ?? undefined,
          paidFor: [
            searchParams.get('to')
              ? {
                  participant: searchParams.get('to')!,
                  shares: '1' as unknown as number,
                }
              : undefined,
          ],
          expenseType: 'EXPENSE',
          splitMode: 'EVENLY',
          documents: [],
          notes: undefined,
        }
      : {
          title: searchParams.get('title') ?? '',
          expenseDate: searchParams.get('date')
            ? new Date(searchParams.get('date') as string)
            : new Date(),
          amount: (searchParams.get('amount') || 0) as unknown as number, // hack,
          category: searchParams.get('categoryId')
            ? Number(searchParams.get('categoryId'))
            : 0, // category with Id 0 is General
          // paid for all, split evenly
          paidFor: group.participants.map(({ id }) => ({
            participant: id,
            shares: '1' as unknown as number,
          })),
          paidBy: getSelectedPayer(),
          expenseType: 'EXPENSE',
          splitMode: 'EVENLY',
          documents: searchParams.get('imageUrl')
            ? [
                {
                  id: randomId(),
                  url: searchParams.get('imageUrl') as string,
                  width: Number(searchParams.get('imageWidth')),
                  height: Number(searchParams.get('imageHeight')),
                },
              ]
            : [],
          notes: searchParams.get('notes') || undefined,
        },
  })
  const [isCategoryLoading, setCategoryLoading] = useState(false)

  const [showOptions, setShowOptions] = useState(false)
  const paidForInvalid = form.getFieldState('paidFor').invalid
  if (paidForInvalid && !showOptions) setShowOptions(true)

  const formValues = form.getValues()
  const paidFor = formValues.paidFor
  const numPaid = paidFor.length

  const [expenseType, setExpenseType] = useState(form.getValues().expenseType)
  const s_transaction =
    expenseType === 'REIMBURSEMENT' ? 'refund' : expenseType.toLowerCase()
  const isIncome = expenseType === 'INCOME'
  const s_Paid = isIncome ? 'Received' : 'Paid'
  const s_paid = isIncome ? 'received' : 'paid'

  const paidForTitle =
    s_Paid +
    ' for ' +
    (numPaid === 0
      ? 'none'
      : numPaid === 1
      ? group.participants.find((p) => p.id === paidFor[0].participant)?.name ??
        'one'
      : numPaid === group.participants.length
      ? 'all'
      : String(numPaid) + ' participants') +
    (formValues.splitMode !== 'EVENLY' ? ' unevenly' : '')

  const FormDescription = ({
    fieldName,
    className,
    ...props
  }: { fieldName?: string } & React.ComponentProps<typeof FDescription>) =>
    !!(fieldName && form.getFieldState(fieldName as any).invalid) || (
      <FDescription className={cn(className, 'hidden sm:block')} {...props} />
    )

  const scrollRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    const r = scrollRef.current
    if (r && window.innerWidth < 640) r.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <Form {...form}>
      <form
        ref={scrollRef}
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
      >
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle>
              {(isCreate ? 'Create ' : 'Edit ') + s_transaction}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel className="hidden sm:inline">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Monday evening restaurant"
                      className="text-base"
                      {...field}
                      onBlur={async () => {
                        field.onBlur() // avoid skipping other blur event listeners since we overwrite `field`
                        if (runtimeFeatureFlags.enableCategoryExtract) {
                          setCategoryLoading(true)
                          const { categoryId } = await extractCategoryFromTitle(
                            field.value,
                          )
                          form.setValue('category', categoryId)
                          setCategoryLoading(false)
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription fieldName={field.name}>
                    Enter a description for the {s_transaction}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expenseDate"
              render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      className="date-base"
                      type="date"
                      defaultValue={formatDate(field.value)}
                      onChange={(event) =>
                        field.onChange(new Date(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription fieldName={field.name}>
                    Enter the date the {s_transaction} was {s_paid}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field: { onChange, ...field } }) => (
                <FormItem className="order-2">
                  <FormLabel>
                    Amount
                    <span className="inline sm:hidden">
                      {' '}
                      in {group.currency}
                    </span>
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        className="text-base min-w-[80px]"
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        onChange={(event) =>
                          enforceCurrencyPattern(event.target.value)
                        }
                        onFocus={(e) => {
                          {
                            // we're adding a small delay to get around safaris issue with onMouseUp deselecting things again
                            let target = e.currentTarget
                            setTimeout(function () {
                              target.select()
                            }, 1)
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                    <span className="hidden sm:block sm:mr-2">
                      {group.currency}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expenseType"
              render={({ field }) => (
                <FormItem className="order-3">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value: typeof expenseType) => {
                        if (value === 'REIMBURSEMENT') {
                          form.setValue('category', 1)
                        }
                        form.setValue(field.name, value)
                        setExpenseType(value)
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="REIMBURSEMENT">Refund</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription fieldName={field.name}>
                    {expenseType === 'EXPENSE'
                      ? 'Outgoing payment: increases group spending.'
                      : expenseType === 'INCOME'
                      ? 'Incoming payment: reduces group spending.'
                      : 'Internal payment: does not affect group spending.'}
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="order-4 col-span-2 sm:col-span-1">
                  <FormLabel>Category</FormLabel>
                  <CategorySelector
                    categories={categories}
                    defaultValue={
                      form.watch(field.name) // may be overwritten externally
                    }
                    onValueChange={field.onChange}
                    isLoading={isCategoryLoading}
                  />
                  <FormDescription fieldName={field.name}>
                    Select the {s_transaction} category.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paidBy"
              render={({ field }) => (
                <FormItem className="order-1 col-span-2 sm:col-span-1">
                  <FormLabel>{s_Paid} by</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={getSelectedPayer(field)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a participant" />
                    </SelectTrigger>
                    <SelectContent>
                      {group.participants.map(({ id, name }) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription fieldName={field.name}>
                    Select the person who {s_paid} the {s_transaction}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="sm:mt-4">
          <CardHeader>
            <CardTitle>{paidForTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <Collapsible className="group" open={showOptions}>
              {!!formValues.notes && (
                <div className="text-sm my-2 sm:mb-4 group-[[data-state=open]]:hidden">
                  {formValues.notes}
                </div>
              )}
              {!paidForInvalid && (
                <Button
                  variant="link"
                  className="p-0 before:content-['Show'] group-[[data-state=open]]:before:content-['Hide']"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowOptions(!showOptions)
                  }}
                >
                  {'\u00A0options…'}
                </Button>
              )}
              <CollapsibleContent>
                <CardDescription className="hidden sm:flex my-4 justify-between">
                  Select who the {s_transaction} was {s_paid} for.
                  <Button
                    variant="link"
                    type="button"
                    className="-my-2 -mx-4"
                    onClick={() => {
                      const paidFor = form.getValues().paidFor
                      const allSelected =
                        paidFor.length === group.participants.length
                      const newPaidFor = allSelected
                        ? []
                        : group.participants.map((p) => ({
                            participant: p.id,
                            shares:
                              paidFor.find((pf) => pf.participant === p.id)
                                ?.shares ?? ('1' as unknown as number),
                          }))
                      form.setValue('paidFor', newPaidFor, MarkDirty)
                    }}
                  >
                    {form.getValues().paidFor.length ===
                    group.participants.length ? (
                      <>Select none</>
                    ) : (
                      <>Select all</>
                    )}
                  </Button>
                </CardDescription>
                <FormField
                  control={form.control}
                  name="paidFor"
                  render={() => (
                    <FormItem className="row-span-2 space-y-0">
                      {group.participants.map(({ id, name }) => (
                        <FormField
                          key={id}
                          control={form.control}
                          name="paidFor"
                          render={({ field }) => {
                            const checkParticipant = (check: boolean) => {
                              const v = check
                                ? [
                                    ...field.value,
                                    {
                                      participant: id,
                                      shares: '1' as unknown as number,
                                    },
                                  ]
                                : field.value.filter(
                                    (p) => p.participant !== id,
                                  )
                              form.setValue(field.name, v, MarkDirty)
                            }

                            const formValues = form.getValues()
                            const isDisabled =
                              formValues.expenseType === 'REIMBURSEMENT' &&
                              formValues.paidBy === id
                            const checkIndex = field.value.findIndex(
                              (p) => p.participant === id,
                            )
                            const isChecked = checkIndex >= 0

                            if (isChecked && isDisabled) checkParticipant(false)

                            const splitMode = formValues.splitMode

                            return (
                              <div
                                data-id={`${id}/${splitMode}/${group.currency}`}
                                className="flex items-center border-t last-of-type:border-b last-of-type:!mb-1 -mx-6 px-6 py-3"
                              >
                                <FormItem className="flex-1 flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      disabled={isDisabled}
                                      checked={isChecked}
                                      onCheckedChange={checkParticipant}
                                    />
                                  </FormControl>
                                  <FLabel className="text-sm font-normal flex-1">
                                    {name}
                                  </FLabel>
                                </FormItem>
                                {splitMode !== 'EVENLY' && isChecked && (
                                  <FormField
                                    name={`paidFor[${checkIndex}].shares`}
                                    render={() => {
                                      const sharesLabel = (
                                        <span className="text-sm">
                                          {match(splitMode)
                                            .with('BY_SHARES', () => (
                                              <>share(s)</>
                                            ))
                                            .with('BY_PERCENTAGE', () => <>%</>)
                                            .with('BY_AMOUNT', () => (
                                              <>{group.currency}</>
                                            ))
                                            .otherwise(() => (
                                              <></>
                                            ))}
                                        </span>
                                      )
                                      return (
                                        <div>
                                          <div className="flex gap-1 items-center">
                                            <FormControl>
                                              <Input
                                                className="text-base w-[80px] -my-2"
                                                type="text"
                                                value={
                                                  field.value?.find(
                                                    ({ participant }) =>
                                                      participant === id,
                                                  )?.shares || ''
                                                }
                                                onChange={(event) => {
                                                  const v: any =
                                                    field.value.map((p) =>
                                                      p.participant === id
                                                        ? {
                                                            participant: id,
                                                            shares:
                                                              enforceCurrencyPattern(
                                                                event.target
                                                                  .value,
                                                              ),
                                                          }
                                                        : p,
                                                    )
                                                  form.setValue(
                                                    field.name,
                                                    v,
                                                    MarkDirty,
                                                  )
                                                }}
                                                inputMode={
                                                  splitMode === 'BY_AMOUNT'
                                                    ? 'decimal'
                                                    : 'numeric'
                                                }
                                              />
                                            </FormControl>
                                            {sharesLabel}
                                          </div>
                                          <FormMessage className="float-right" />
                                        </div>
                                      )
                                    }}
                                  />
                                )}
                              </div>
                            )
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid sm:grid-cols-2 mt-4 gap-2 sm:gap-6 sm:pt-3">
                  <FormField
                    control={form.control}
                    name="splitMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Split mode</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value: any) => {
                              const formValues = form.getValues()
                              const pf = formValues.paidFor
                              let shares: number

                              switch (value) {
                                case 'BY_PERCENTAGE':
                                  shares = 100 / (pf.length || 1)
                                  break
                                case 'BY_AMOUNT':
                                  shares = formValues.amount / (pf.length || 1)
                                  break
                                default:
                                  shares = 1
                                  break
                              }

                              const newPf = pf.map((p) => ({
                                participant: p.participant,
                                shares: String(shares) as unknown as number,
                              }))

                              form.setValue(field.name, value)
                              form.setValue('paidFor', newPf, MarkDirty)
                            }}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EVENLY">Evenly</SelectItem>
                              <SelectItem value="BY_SHARES">
                                Unevenly – By shares
                              </SelectItem>
                              <SelectItem value="BY_PERCENTAGE">
                                Unevenly – By percentage
                              </SelectItem>
                              <SelectItem value="BY_AMOUNT">
                                Unevenly – By amount
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Select how to split the {s_transaction}.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>
                          Add comments to the {s_transaction}.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {runtimeFeatureFlags.enableExpenseDocuments && (
          <Card className="sm:mt-4">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Attach documents</span>
              </CardTitle>
              <CardDescription>
                See and attach receipts to the {s_transaction}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="documents"
                render={({ field }) => (
                  <ExpenseDocumentsInput
                    documents={field.value}
                    updateDocuments={field.onChange}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex mt-4 gap-2">
          <SubmitButton
            loadingContent={isCreate ? <>Creating…</> : <>Saving…</>}
          >
            <Save className="w-4 h-4 mr-2" />
            {isCreate ? <>Create</> : <>Save</>}
          </SubmitButton>
          {!isCreate && onDelete && (
            <DeletePopup onDelete={onDelete}></DeletePopup>
          )}
          <Button variant="ghost" asChild>
            <Link href={`/groups/${group.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  )
}

const CardHeader = ({
  className,
  ...props
}: React.ComponentProps<typeof CHeader>) => (
  <CHeader className={cn('pt-4 pb-3 sm:pt-6 sm:pb-6', className)} {...props} />
)

const FormLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof FLabel>) => (
  <FLabel className={cn('block mt-1 -mb-1 sm:inline', className)} {...props} />
)

const FormMessage = ({
  className,
  ...props
}: React.ComponentProps<typeof FDescription>) => (
  <FMessage
    className={cn('text-xs pb-2 sm:pb-0 sm:text-sm', className)}
    {...props}
  />
)

function formatDate(date?: Date) {
  if (!date || isNaN(date as any)) date = new Date()
  return date.toISOString().substring(0, 10)
}
