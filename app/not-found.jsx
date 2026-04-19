import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 text-[#111827] sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl [font-family:var(--font-heading)]">
          Oh you searched for a page, Zoro went to found it, hope he found it soon.
        </h1>

        <div className="relative mt-8 w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm">
          <img
            src="/404_ZORO.jpg"
            alt="Zoro searching for the page"
            className="h-auto w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="select-none text-[5.5rem] font-black tracking-[0.18em] text-black/25 [text-shadow:0_4px_18px_rgba(255,255,255,0.6)] sm:text-[7rem]">
              404
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-black px-5 py-2.5 text-sm font-bold text-white transition"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800"
          >
            Go To Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
