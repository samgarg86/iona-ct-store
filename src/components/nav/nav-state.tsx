"use client";

// Interactive shell for the main nav. All links and labels are server-rendered and passed in as
// children; these components only track which panel is open. Nothing here reads the viewport while
// rendering, so server and client HTML always match and the layout switches purely via CSS.

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

interface NavState {
  openPanel: string | null;
  drawerOpen: boolean;
  togglePanel: (id: string) => void;
  showPanel: (id: string) => void;
  toggleDrawer: () => void;
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

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  return (
    <NavContext value={{ openPanel, drawerOpen, togglePanel, showPanel, toggleDrawer, hoverPanel }}>
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

/** Hamburger button; hidden on desktop, where the nav is always visible. */
export function NavDrawerToggle() {
  const { drawerOpen, toggleDrawer } = useNav();

  return (
    <button
      type="button"
      aria-controls={NAV_ID}
      aria-expanded={drawerOpen}
      onClick={toggleDrawer}
      className="-ml-2 rounded-md p-2 hover:bg-surface lg:hidden"
    >
      <span className="sr-only">{drawerOpen ? "Close menu" : "Open menu"}</span>
      <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
        {drawerOpen ? (
          <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        ) : (
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        )}
      </svg>
    </button>
  );
}

interface NavMenuProps {
  label: string;
  children: ReactNode;
}

/** The single nav element: a drawer below the header on mobile, an inline row on desktop. */
export function NavMenu({ label, children }: NavMenuProps) {
  const { drawerOpen } = useNav();

  return (
    <nav
      id={NAV_ID}
      aria-label={label}
      data-open={drawerOpen || undefined}
      className="order-last mt-2 hidden w-full data-open:block lg:order-none lg:mt-0 lg:block lg:w-auto lg:self-stretch"
    >
      {children}
    </nav>
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
