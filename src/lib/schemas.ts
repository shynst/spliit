import { ExpenseType, SplitMode } from '@prisma/client'
import * as z from 'zod'

export const groupFormSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Enter at least two characters.')
      .max(50, 'Enter at most 50 characters.'),
    participants: z
      .array(
        z.object({
          id: z.string().optional(),
          name: z
            .string()
            .min(2, 'Enter at least two characters.')
            .max(50, 'Enter at most 50 characters.'),
        }),
      )
      .min(1),
  })
  .superRefine(({ participants }, ctx) => {
    participants.forEach((participant, i) => {
      participants.slice(0, i).forEach((otherParticipant) => {
        if (otherParticipant.name === participant.name) {
          ctx.addIssue({
            code: 'custom',
            message: 'Another participant already has this name.',
            path: ['participants', i, 'name'],
          })
        }
      })
    })
  })

export type GroupFormValues = z.infer<typeof groupFormSchema>

export const expenseFormSchema = z
  .object({
    expenseDate: z.coerce.date(),
    title: z
      .string({ required_error: 'Please enter a title.' })
      .min(2, 'Enter at least two characters.'),
    category: z.coerce.number().default(0),
    amount: z
      .union(
        [
          z.number(),
          z.string().transform((value, ctx) => {
            const valueAsNumber = Number(value)
            if (Number.isNaN(valueAsNumber))
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Invalid number.',
              })
            return Math.round(valueAsNumber * 100)
          }),
        ],
        { required_error: 'You must enter an amount.' },
      )
      .refine((amount) => amount != 1, 'The amount must not be zero.')
      .refine(
        (amount) => amount <= 10_000_000_00,
        'The amount must be lower than 10,000,000.',
      ),
    currency: z
      .string()
      .min(1, 'Must not be empty.')
      .max(5, 'Enter at most five characters.'),
    paidBy: z.string({ required_error: 'You must select a participant.' }),
    paidFor: z
      .array(
        z.object({
          participant: z.string(),
          shares: z.union([
            z.number(),
            z.string().transform((value, ctx) => {
              const normalizedValue = value.replace(/,/g, '.')
              const valueAsNumber = Number(normalizedValue)
              if (Number.isNaN(valueAsNumber))
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'Invalid number.',
                })
              return Math.round(valueAsNumber * 100)
            }),
          ]),
        }),
      )
      .min(1, 'The transaction must include at least one participant.')
      .superRefine((paidFor, ctx) => {
        for (const { shares } of paidFor) {
          if (shares < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'All shares must be higher than 0.',
            })
          }
        }
      }),
    splitMode: z
      .enum<
        SplitMode,
        [SplitMode, ...SplitMode[]]
      >(Object.values(SplitMode) as [SplitMode, ...SplitMode[]])
      .default('EVENLY'),
    expenseType: z
      .enum<
        ExpenseType,
        [ExpenseType, ...ExpenseType[]]
      >(Object.values(ExpenseType) as [ExpenseType, ...ExpenseType[]])
      .default('EXPENSE'),
    documents: z
      .array(
        z.object({
          id: z.string(),
          url: z.string().url(),
          width: z.number().int().min(1),
          height: z.number().int().min(1),
        }),
      )
      .default([]),
    notes: z.string().optional(),
  })
  .superRefine((expense, ctx) => {
    let sum = 0
    for (const { shares } of expense.paidFor) {
      sum +=
        typeof shares === 'number' ? shares : Math.round(Number(shares) * 100)
    }
    switch (expense.splitMode) {
      case 'EVENLY':
        break // noop
      case 'BY_SHARES':
        break // noop
      case 'BY_AMOUNT': {
        if (sum !== expense.amount) {
          const detail =
            sum < expense.amount
              ? `${((expense.amount - sum) / 100).toFixed(2)} missing`
              : `${((sum - expense.amount) / 100).toFixed(2)} surplus`
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Sum of amounts must equal the expense amount (${detail}).`,
            path: ['paidFor'],
          })
        }
        break
      }
      case 'BY_PERCENTAGE': {
        if (sum !== 10000) {
          const detail =
            sum < 10000
              ? `${((10000 - sum) / 100).toFixed(0)}% missing`
              : `${((sum - 10000) / 100).toFixed(0)}% surplus`
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Sum of percentages must equal 100 (${detail})`,
            path: ['paidFor'],
          })
        }
        break
      }
    }

    const paidForSelf = !!expense.paidFor.find(
      (x) => x.participant === expense.paidBy,
    )
    if (paidForSelf && expense.expenseType === 'REIMBURSEMENT') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'For refund payments the payer must not be a member of the recipients!',
        path: ['paidFor'],
      })
    }
  })

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>
