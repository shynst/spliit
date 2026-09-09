'use client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HistoryIcon, SettingsIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export function GroupTabs({ groupId }: { groupId: string }) {
  const pathname = usePathname()
  const value = pathname.match(/\/groups\/[^/]+\/([^/]+)\/?$/)?.[1]
  const router = useRouter()

  return (
    value && (
      <Tabs
        value={value}
        className="[&>*]:border max-sm:-mx-4"
        onValueChange={(value) => {
          router.push(`/groups/${groupId}/${value}`)
          router.refresh()
        }}
      >
        <TabsList className="max-sm:w-full rounded-none sm:rounded-md">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="history">
            <HistoryIcon strokeWidth={1.5} />
          </TabsTrigger>
          <TabsTrigger value="edit">
            <SettingsIcon strokeWidth={1.5} />
          </TabsTrigger>
          <div className="max-sm:w-full" />
        </TabsList>
      </Tabs>
    )
  )
}
