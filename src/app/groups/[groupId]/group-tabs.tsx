'use client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export function GroupTabs({ groupId }: { groupId: string }) {
  const pathname = usePathname()
  const value = pathname.match(/\/groups\/[^\/]+\/(.*)\/?$/)?.[1] || 'expenses'
  const router = useRouter()

  return (
    <Tabs
      value={value}
      className="[&>*]:border"
      onValueChange={(value) => {
        router.push(`/groups/${groupId}/${value}`)
        router.refresh()
      }}
    >
      <TabsList>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="balances">Balances</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="edit">
          <Settings strokeWidth={1.5} />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
