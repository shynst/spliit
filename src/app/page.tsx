import img from '@/app/apple-icon.png'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

// FIX for https://github.com/vercel/next.js/issues/58615
// export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <main>
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container flex max-w-screen-md flex-col items-center gap-4 text-center">
          <h1 className="!leading-none font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl landing-header py-2">
            Share <strong>Expenses</strong> <br /> with <strong>Friends</strong>{' '}
            & <strong>Family</strong>
          </h1>
          <Link href="/groups">
            <Image
              src={img}
              className="m-1 h-auto w-auto"
              width={256}
              height={256}
              style={{ borderRadius: '50%' }}
              alt="Spliit"
            />
          </Link>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Welcome to <strong>Spliit</strong>, a minimalist web application to
            share expenses with friends and family. No ads, no account, no
            problem.
          </p>
          <Button className="m-4 sm:text-lg">
            <Link href="/groups">Go to groups</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
