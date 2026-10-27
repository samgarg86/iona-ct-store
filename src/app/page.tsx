import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Iona Store</h1>
      <p className="text-zinc-600">
        A small commercetools storefront: product listing, product detail and cart.
      </p>
      <Link href="/products" className="font-medium underline">
        Browse products
      </Link>
    </main>
  );
}
