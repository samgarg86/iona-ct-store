import { Search } from "lucide-react";
import Form from "next/form";

const inputClass =
  "w-full rounded-full border border-border bg-background py-2 pr-4 pl-10 text-sm outline-hidden placeholder:text-muted focus:border-foreground";

/** Search form submitting to the PLP as `?q=`; `next/form` turns the submit into a client navigation. */
export function SearchForm({ id, className }: { id: string; className?: string }) {
  return (
    <Form action="/products" role="search" className={`relative ${className ?? ""}`}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
        strokeWidth={1.5}
      />
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Search products"
        className={inputClass}
      />
    </Form>
  );
}

