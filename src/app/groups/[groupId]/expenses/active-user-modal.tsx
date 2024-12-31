'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { APIGroup } from '@/lib/api'
import { useMediaQuery } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { ComponentProps, useEffect, useState } from 'react'

export function ActiveUserModal({ group }: { group: APIGroup }) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    const tempUser = localStorage.getItem(`newGroup-activeUser`)
    const activeUser = localStorage.getItem(`${group.id}-activeUser`)
    if (
      (!tempUser || tempUser.toLowerCase() === 'none') &&
      (!activeUser || activeUser.toLowerCase() === 'none')
    ) {
      setOpen(true)
    }
  }, [group])

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Who are you?</DialogTitle>
            <DialogDescription>
              Tell us which participant you are to let us customize how the
              information is displayed.
            </DialogDescription>
          </DialogHeader>
          <ActiveUserForm group={group} close={() => setOpen(false)} />
          <DialogFooter className="sm:justify-center">
            <p className="text-sm text-center text-muted-foreground">
              This is also used to preselect who pays for new expenses.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Who are you?</DrawerTitle>
          <DrawerDescription>
            Tell us which participant you are to let us customize how the
            information is displayed.
          </DrawerDescription>
        </DrawerHeader>
        <ActiveUserForm
          className="px-4"
          group={group}
          close={() => setOpen(false)}
        />
        <DrawerFooter className="pt-2">
          <p className="text-sm text-center text-muted-foreground">
            This is also used to preselect who pays for new expenses.
          </p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ActiveUserForm({
  group,
  close,
  className,
}: ComponentProps<'form'> & { group: APIGroup; close: () => void }) {
  const [selected, setSelected] = useState('None')

  return (
    <form
      className={cn('grid items-start gap-4', className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (selected === 'None') return
        localStorage.setItem(`${group.id}-activeUser`, selected)
        close()
      }}
    >
      <RadioGroup defaultValue="none" onValueChange={setSelected}>
        <div className="flex flex-col gap-4 my-4">
          {group.participants.map((participant) => (
            <div key={participant.id} className="flex items-center space-x-2">
              <RadioGroupItem value={participant.id} id={participant.id} />
              <Label htmlFor={participant.id} className="flex-1">
                {participant.name}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
      <Button type="submit">Save changes</Button>
    </form>
  )
}
