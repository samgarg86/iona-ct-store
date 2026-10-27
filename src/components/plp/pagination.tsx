import Link from "next/link";

interface PaginationProps {
  page: number;
  pageCount: number;
  hrefForPage: (page: number) => string;
}

export function Pagination({ page, pageCount, hrefForPage }: PaginationProps) {
  if (pageCount <= 1) return null;

  const linkClass = "rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground";
  const disabledClass = "rounded-md border border-border px-3 py-1.5 text-sm text-muted opacity-50";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link href={hrefForPage(page - 1)} rel="prev" className={linkClass}>
          Previous
        </Link>
      ) : (
        <span className={disabledClass}>Previous</span>
      )}
      <span className="text-sm text-muted">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={hrefForPage(page + 1)} rel="next" className={linkClass}>
          Next
        </Link>
      ) : (
        <span className={disabledClass}>Next</span>
      )}
    </nav>
  );
}
