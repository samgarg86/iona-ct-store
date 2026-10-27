import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Product not found</h1>
      <p className="text-muted">This product may have been removed or the link is incorrect.</p>
      <Link href="/products" className="rounded-full bg-foreground px-5 py-2 text-sm text-background">
        Continue shopping
      </Link>
    </main>
  );
}
