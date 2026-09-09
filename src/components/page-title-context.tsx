'use client'

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'

type PageTitleContextValue = {
  title: string | undefined
  setTitle: (title: string | undefined) => void
}

const PageTitleContext = createContext<PageTitleContextValue | undefined>(
  undefined,
)

export function PageTitleProvider({ children }: PropsWithChildren) {
  const [title, setTitle] = useState<string>()

  return (
    <PageTitleContext value={{ title, setTitle }}>{children}</PageTitleContext>
  )
}

export function usePageTitle() {
  const context = useContext(PageTitleContext)
  if (!context) {
    throw new Error('usePageTitle must be used within PageTitleProvider')
  }

  return context.title
}

export function PageTitle({ title }: { title: string }) {
  const context = useContext(PageTitleContext)

  if (!context) {
    throw new Error('PageTitle must be used within PageTitleProvider')
  }

  useEffect(() => {
    context.setTitle(title)
    return () => context.setTitle(undefined)
  }, [context, title])

  return null
}
