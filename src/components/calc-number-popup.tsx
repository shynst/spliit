'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ReactElement, useState } from 'react'

function calculateFormula(formula: string): number | null {
  const tokens = formula.match(/\s*(?:\d+(?:\.\d*)?|\.\d+|[()+\-*/])\s*/g)
  if (!tokens || tokens.join('') !== formula) return null

  const values = tokens.map((token) => token.trim())
  let index = 0

  const parseExpression = (): number | null => {
    let value = parseTerm()
    while (value !== null && (values[index] === '+' || values[index] === '-')) {
      const operator = values[index++]
      const next = parseTerm()
      if (next === null) return null
      value = operator === '+' ? value + next : value - next
    }
    return value
  }

  const parseTerm = (): number | null => {
    let value = parsePrimary()
    while (value !== null && (values[index] === '*' || values[index] === '/')) {
      const operator = values[index++]
      const next = parsePrimary()
      if (next === null || (operator === '/' && next === 0)) return null
      value = operator === '*' ? value * next : value / next
    }
    return value
  }

  const parsePrimary = (): number | null => {
    const token = values[index++]
    if (token === '+' || token === '-') {
      const value = parsePrimary()
      return value === null ? null : token === '-' ? -value : value
    }
    if (token === '(') {
      const value = parseExpression()
      if (values[index++] !== ')') return null
      return value
    }
    if (!token || !/^\d+(?:\.\d*)?$|^\.\d+$/.test(token)) return null
    return Number(token)
  }

  const result = parseExpression()
  return result !== null && index === values.length && Number.isFinite(result)
    ? result
    : null
}

type Props = {
  value: string | number
  onChange: (value: number) => void
  trigger: ReactElement
}

export function CalcNumberPopup({ value, onChange, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [formula, setFormula] = useState('')
  const [formulaError, setFormulaError] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) {
          setFormula(String(value))
          setFormulaError(false)
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Calculate amount</DialogTitle>
          <DialogDescription>
            Enter an arithmetic formula, such as: (32+4)/3
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const result = calculateFormula(formula)
            if (result === null) {
              setFormulaError(true)
              return
            }
            onChange(result)
            setOpen(false)
          }}
          className="space-y-4"
        >
          <Input
            autoFocus
            value={formula}
            onChange={(event) => {
              setFormula(event.target.value)
              setFormulaError(false)
            }}
            placeholder="(32+4)/3"
            aria-invalid={formulaError}
          />
          {formulaError && (
            <p className="text-sm text-destructive">Enter a valid formula.</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Apply</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
