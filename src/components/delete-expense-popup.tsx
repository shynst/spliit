'use client'
import { cached } from '@/app/cached-functions'
import { APIExpense, deleteExpense } from '@/lib/api'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AsyncButton } from './async-button'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

export const DeleteExpensePopup = ({ expense }: { expense: APIExpense }) => {
  const router = useRouter()
  const activeUser = cached.getActiveUser(expense.groupId)

  async function onDelete() {
    await deleteExpense(expense.id, activeUser)
    router.push(`/groups/${expense.groupId}/expenses`)
    router.refresh()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete expense</DialogTitle>
        <DialogDescription>
          Do you really want to delete this expense?
        </DialogDescription>
        <DialogFooter>
          <AsyncButton
            type="button"
            variant="destructive"
            loadingContent="Deleting…"
            action={onDelete}
          >
            Yes
          </AsyncButton>
          <Button asChild variant={'secondary'}>
            <DialogClose>Cancel</DialogClose>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
