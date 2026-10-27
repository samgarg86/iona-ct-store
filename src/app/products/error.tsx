"use client";

export default function ProductsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">We couldn’t load products</h1>
      <p className="text-muted">Something went wrong talking to the store. Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-foreground px-5 py-2 text-sm text-background"
      >
        Try again
      </button>
    </main>
  );
}
