export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[rgba(15,45,61,0.45)]" />

        <div className="relative z-10 min-h-screen flex items-center px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-sm border border-[rgba(129,195,215,0.35)] bg-[rgba(129,195,215,0.12)] px-4 py-2 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--white)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" />
              Ottawa &amp; Surrounding Area
            </div>

            <h1 className="mt-8 font-sans font-light text-balance text-[clamp(3.25rem,7vw,6rem)] leading-[0.95] text-[var(--white)]">
              WATER
              <br />
              <span className="text-[var(--cyan)]">DELIVERED</span>
              <br />
              FAST.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[rgba(217,220,214,0.92)]">
              Bulk water delivery for pools, hot tubs, rural wells, and construction sites across Ottawa. Same-day
              service available. One call, we handle the rest.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="tel:6137625464"
                className="inline-flex items-center justify-center rounded-sm bg-[var(--cyan)] px-7 py-4 font-semibold text-[var(--ink)] transition hover:bg-[var(--cyan-dk)]"
              >
                (613) 762-5464
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-sm border border-[rgba(217,220,214,0.35)] bg-[rgba(15,45,61,0.22)] px-7 py-4 font-medium text-[var(--white)] backdrop-blur-sm transition hover:border-[rgba(129,195,215,0.55)] hover:text-[var(--cyan)]"
              >
                Get a Free Quote →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

