import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main>
      <section className="py-8 sm:py-16 md:py-24 lg:py-32">
        <div className="container flex max-w-screen-md flex-col items-center sm:gap-4 text-center">
          <h1 className="mb-4 font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl landing-header">
            Share <strong>Expenses</strong> <br /> with <strong>Friends</strong>{' '}
            & <strong>Family</strong>
          </h1>
          <Link href="/groups">
            <Image
              src="/logo.svg"
              width="512"
              height="512"
              className="w-52 h-52"
              alt="Spliit"
            />
          </Link>
          <p className="mt-4 sm:text-xl">
            Welcome to <strong>Spliit</strong>, a minimalist web application to
            share expenses with friends and family. No ads, no account, no
            problem.
          </p>
          <p className="mt-4 sm:text-xl text-muted-foreground">
            Version {process.env.appVersion}
          </p>
        </div>
      </section>
    </main>
  )
}
