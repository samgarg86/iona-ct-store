"use client";

import { Search, X } from "lucide-react";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { iconButtonClass } from "@/components/icon-button";
import { SearchForm } from "@/components/site-search";

/**
 * Mobile search: the search button toggles a search row below the header bar. The header grows to
 * reveal it (see `SiteHeader`); the row is positioned against the header, which clips it.
 */
export function MobileSearch() {
  const [open, setOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  function toggle() {
    // Render first: an invisible input can't take focus, and iOS only opens the keyboard on a
    // focus() made inside the tap handler
    flushSync(() => setOpen(!open));
    if (!open) rowRef.current?.querySelector("input")?.focus();
  }

  return (
    <div data-search-open={open || undefined} className="lg:hidden">
      <button type="button" aria-expanded={open} onClick={toggle} className={iconButtonClass}>
        <span className="sr-only">{open ? "Close search" : "Search"}</span>
        {open ? <X className="size-5" strokeWidth={1.5} /> : <Search className="size-5" strokeWidth={1.5} />}
      </button>
      {/* Hidden only once the header has finished collapsing over it */}
      <div
        ref={rowRef}
        onSubmit={() => setOpen(false)}
        className={`absolute inset-x-0 top-13 px-4 ${open ? "visible" : "invisible transition-[visibility] duration-200"}`}
      >
        <SearchForm id="mobile-search" />
      </div>
    </div>
  );
}
