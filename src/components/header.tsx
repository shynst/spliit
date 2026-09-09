'use client'

import { usePageTitle } from '@/components/page-title-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

export function Header() {
  const title = usePageTitle()

  return (
    <header className="fixed top-0 left-0 right-0 h-12 sm:h-16 flex justify-between bg-white dark:bg-gray-950 bg-opacity-50 dark:bg-opacity-50 p-2 border-b backdrop-blur-sm z-50">
      <div className="flex items-center gap-1">
        <Link className="hover:scale-105 transition-transform" href="/">
          <h1>
            <div className="m-1 w-8 h-8 bg-no-repeat bg-cover bg-[url(/logo.svg)] sm:w-32 sm:h-12 sm:bg-[url(/logo-with-text.png)]" />
          </h1>
        </Link>
        {title && <span className="font-semibold sm:hidden">{title}</span>}
      </div>

      <div role="navigation" aria-label="Menu" className="flex">
        <ul className="flex items-center text-sm">
          <li>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-primary"
            >
              <Link href="/about">
                <InfoCircledIcon className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">About</span>
              </Link>
            </Button>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </header>
  )
}
