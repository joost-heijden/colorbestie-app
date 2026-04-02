export default function AppLoading() {
  return (
    <main className="mx-auto h-[100dvh] w-full max-w-hero overflow-hidden px-3 py-3 pb-24 sm:px-4 sm:py-4 md:px-8">
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden sm:gap-4">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_-14px_var(--shadow)] sm:p-5">
          <div className="h-4 w-28 animate-pulse rounded bg-[var(--surface-2)]" />
          <div className="mt-3 h-7 w-48 animate-pulse rounded bg-[var(--surface-2)]" />
          <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-[var(--surface-2)]" />
        </section>

        <section className="card-soft min-h-0 flex-1 p-4 sm:p-5">
          <div className="h-5 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
          <div className="mt-4 h-[56vh] min-h-60 animate-pulse rounded-3xl bg-gradient-to-br from-[#fff0f5] to-[#ffe4ee]" />
          <div className="mt-4 h-4 w-48 animate-pulse rounded bg-[var(--surface-2)]" />
          <div className="mt-2 h-4 w-36 animate-pulse rounded bg-[var(--surface-2)]" />
        </section>

        <section className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="h-11 w-full animate-pulse rounded-full bg-[var(--surface-2)]" />
        </section>
      </div>
    </main>
  );
}
