export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--white)] text-[var(--ink)]">
      <div className="mx-auto max-w-4xl px-6 md:px-12 py-16">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-4 text-lg text-[var(--ink4)]">
          Call us at{" "}
          <a className="font-semibold text-[var(--ink2)] hover:text-[var(--cyan-dk)]" href="tel:6137625464">
            (613) 762-5464
          </a>
          .
        </p>
      </div>
    </main>
  );
}

