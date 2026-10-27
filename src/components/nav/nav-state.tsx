"use client";

// Interactive shell for the main nav. All links and labels are server-rendered and passed in as
// children; these components only track which panel is open. Nothing here reads the viewport while
// rendering, so server and client HTML always match and the layout switches purely via CSS.

import Link from "next/link";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

const HOVER_DELAY_MS = 150;
const DESKTOP_QUERY = "(min-width: 64rem)"; // Tailwind `lg`

export const NAV_ID = "main-nav";
const DRAWER_OPEN_ID = "nav-drawer-open";
const DRAWER_CLOSE_ID = "nav-drawer-close";

interface NavState {
  openPanel: string | null;
  drawerOpen: boolean;
  togglePanel: (id: string) => void;
  showPanel: (id: string) => void;
  toggleDrawer: () => void;
  closeAll: () => void;
  hoverPanel: (id: string | null) => void;
}

const NavContext = createContext<NavState | null>(null);

function useNav(): NavState {
  const state = use(NavContext);
  if (!state) throw new Error("Nav components must be rendered inside <NavProvider>");
  return state;
}

const panelId = (id: string) => `nav-panel-${id}`;
const triggerId = (id: string) => `nav-trigger-${id}`;

interface NavProviderProps {
  className?: string;
  children: ReactNode;
}

/** Wraps the header row so outside clicks, Escape and link clicks close the menu. */
export function NavProvider({ className, children }: NavProviderProps) {
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const closeAll = useCallback(() => {
    clearTimeout(hoverTimer.current);
    setOpenPanel(null);
    setDrawerOpen(false);
  }, []);

  const togglePanel = useCallback((id: string) => {
    clearTimeout(hoverTimer.current);
    setOpenPanel((current) => (current === id ? null : id));
  }, []);

  const showPanel = useCallback((id: string) => {
    clearTimeout(hoverTimer.current);
    setOpenPanel(id);
  }, []);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((open) => !open);
    setOpenPanel(null);
  }, []);

  // Desktop hover only: in the mobile drawer panels are accordions and open on tap
  const hoverPanel = useCallback((id: string | null) => {
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenPanel(id), HOVER_DELAY_MS);
  }, []);

  const anythingOpen = openPanel !== null || drawerOpen;

  useEffect(() => {
    if (!anythingOpen) return;

    function onPointerDown(event: globalThis.PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closeAll();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (openPanel) document.getElementById(triggerId(openPanel))?.focus();
      closeAll();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anythingOpen, openPanel, closeAll]);

  // While the mobile drawer is open: lock page scroll, move focus into the drawer, and close it if
  // the window grows to desktop width (where the drawer doesn't exist). The drawer only delays
  // `visibility` when closing, so it is already focusable here.
  useEffect(() => {
    if (!drawerOpen) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    document.getElementById(DRAWER_CLOSE_ID)?.focus();

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (desktop.matches) closeAll();
    };
    desktop.addEventListener("change", onChange);

    return () => {
      root.style.overflow = previousOverflow;
      desktop.removeEventListener("change", onChange);
      if (document.getElementById(NAV_ID)?.contains(document.activeElement)) {
        document.getElementById(DRAWER_OPEN_ID)?.focus();
      }
    };
  }, [drawerOpen, closeAll]);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  return (
    <NavContext value={{ openPanel, drawerOpen, togglePanel, showPanel, toggleDrawer, closeAll, hoverPanel }}>
      <div
        ref={rootRef}
        className={className}
        onClick={(event) => {
          // Following any link (category, logo, About) closes the menu
          if (event.target instanceof Element && event.target.closest("a")) closeAll();
        }}
      >
        {children}
      </div>
    </NavContext>
  );
}

const iconButtonClass = "rounded-md p-2 hover:bg-surface lg:hidden";

/** Hamburger button; hidden on desktop, where the nav is always visible. */
export function NavDrawerToggle() {
  const { drawerOpen, toggleDrawer } = useNav();

  return (
    <button
      type="button"
      id={DRAWER_OPEN_ID}
      aria-controls={NAV_ID}
      aria-expanded={drawerOpen}
      onClick={toggleDrawer}
      className={`-ml-2 ${iconButtonClass}`}
    >
      <span className="sr-only">Open menu</span>
      <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  );
}

interface NavMenuProps {
  label: string;
  children: ReactNode;
}

/**
 * The single nav element: an off-canvas drawer over the page on mobile, an inline row in the
 * header on desktop. The `lg:` classes undo every drawer style, so both share one markup.
 * Desktop needs `translate-none` (not `translate-x-0`): any translate makes the nav the containing
 * block, and the mega menu panels must position against the full-width header instead.
 */
export function NavMenu({ label, children }: NavMenuProps) {
  const { drawerOpen, toggleDrawer, closeAll } = useNav();
  const open = drawerOpen || undefined;

  return (
    <>
      <div
        aria-hidden
        data-open={open}
        onClick={closeAll}
        className="invisible fixed inset-0 z-40 bg-foreground/40 opacity-0 transition-[opacity,visibility] data-open:visible data-open:opacity-100 motion-reduce:transition-none lg:hidden"
      />
      <nav
        id={NAV_ID}
        aria-label={label}
        data-open={open}
        className="invisible fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm -translate-x-full overflow-y-auto bg-background px-4 pb-8 shadow-xl transition-[translate,visibility] duration-200 data-open:visible data-open:transition-[translate] data-open:translate-x-0 motion-reduce:transition-none lg:visible lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-none lg:self-stretch lg:overflow-visible lg:bg-transparent lg:px-0 lg:pb-0 lg:shadow-none lg:transition-none"
      >
        <div className="flex h-16 items-center justify-between border-b border-border lg:hidden">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Iona
          </Link>
          <button
            type="button"
            id={DRAWER_CLOSE_ID}
            onClick={toggleDrawer}
            className={`-mr-2 ${iconButtonClass}`}
          >
            <span className="sr-only">Close menu</span>
            <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </nav>
    </>
  );
}

interface NavItemProps {
  id: string;
  children: ReactNode;
}

/** A top-level item with a panel; hovering it (or its panel) opens the panel on desktop. */
export function NavItem({ id, children }: NavItemProps) {
  const { hoverPanel } = useNav();
  const onMouse = (event: PointerEvent, next: string | null) => {
    if (event.pointerType === "mouse") hoverPanel(next);
  };

  return (
    <li
      className="border-b border-border lg:flex lg:border-0"
      onPointerEnter={(event) => onMouse(event, id)}
      onPointerLeave={(event) => onMouse(event, null)}
    >
      {children}
    </li>
  );
}

interface NavTriggerProps {
  id: string;
  children: ReactNode;
}

export function NavTrigger({ id, children }: NavTriggerProps) {
  const { openPanel, togglePanel, showPanel } = useNav();
  const open = openPanel === id;

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    // Hover has usually opened the panel already, so a mouse click shouldn't close it again.
    // Keyboard (pointerType "") and touch clicks toggle.
    const { pointerType } = event.nativeEvent as globalThis.PointerEvent;
    if (pointerType === "mouse" && window.matchMedia(DESKTOP_QUERY).matches) showPanel(id);
    else togglePanel(id);
  }

  return (
    <button
      type="button"
      id={triggerId(id)}
      aria-expanded={open}
      aria-controls={panelId(id)}
      onClick={onClick}
      className="flex w-full items-center justify-between gap-1 py-3 font-medium lg:w-auto lg:border-b-2 lg:border-transparent lg:py-0 lg:aria-expanded:border-foreground"
    >
      {children}
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
      </svg>
    </button>
  );
}

interface NavPanelProps {
  id: string;
  children: ReactNode;
}

/** Accordion content in the mobile drawer; a full-width dropdown under the header on desktop. */
export function NavPanel({ id, children }: NavPanelProps) {
  const { openPanel } = useNav();

  return (
    <div
      id={panelId(id)}
      hidden={openPanel !== id}
      className="pb-4 lg:absolute lg:inset-x-0 lg:top-full lg:z-20 lg:border-b lg:border-border lg:bg-background lg:pb-0 lg:shadow-sm"
    >
      {children}
    </div>
  );
}
