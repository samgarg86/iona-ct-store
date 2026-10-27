"use client";

// Interactive parts of the main nav: which mega menu panel is open. Links and labels are
// server-rendered and passed in as children, and the mobile drawer is a native popover, so the only
// state here is the open panel. Nothing reads the viewport while rendering, so server and client
// HTML always match and the layout switches purely via CSS.

import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";

const HOVER_DELAY_MS = 150;
const DESKTOP_QUERY = "(min-width: 64rem)"; // Tailwind `lg`

interface NavState {
  openPanel: string | null;
  setOpenPanel: (id: string | null) => void;
  hoverPanel: (id: string | null) => void;
}

const NavContext = createContext<NavState | null>(null);

function useNav(): NavState {
  const state = use(NavContext);
  if (!state) throw new Error("NavDropdown must be rendered inside <NavProvider>");
  return state;
}

const panelId = (id: string) => `nav-panel-${id}`;
const triggerId = (id: string) => `nav-trigger-${id}`;

/** Hover only applies to a mouse on desktop; in the mobile drawer panels are tap-to-toggle accordions. */
function isDesktopMouse(pointerType: string): boolean {
  return pointerType === "mouse" && window.matchMedia(DESKTOP_QUERY).matches;
}

interface NavProviderProps {
  className?: string;
  children: ReactNode;
}

/** Wraps the header row so outside clicks, Escape and link clicks close the menu. */
export function NavProvider({ className, children }: NavProviderProps) {
  const [openPanel, setOpenPanelNow] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function setOpenPanel(id: string | null) {
    clearTimeout(hoverTimer.current);
    setOpenPanelNow(id);
  }

  function hoverPanel(id: string | null) {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenPanelNow(id), HOVER_DELAY_MS);
  }

  useEffect(() => {
    if (!openPanel) return;
    const panel = openPanel;

    function onPointerDown(event: globalThis.PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpenPanelNow(null);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // In the drawer the popover closes itself on Escape and returns focus to the hamburger
      const inDrawer = rootRef.current?.querySelector(":popover-open");
      if (!inDrawer) document.getElementById(triggerId(panel))?.focus();
      setOpenPanelNow(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openPanel]);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  return (
    <NavContext value={{ openPanel, setOpenPanel, hoverPanel }}>
      <div
        ref={rootRef}
        className={className}
        onClick={(event) => {
          // Following any link closes the open panel and, if the link is inside it, the drawer
          const link = event.target instanceof Element ? event.target.closest("a") : null;
          if (!link) return;
          setOpenPanel(null);
          link.closest<HTMLElement>("[popover]")?.hidePopover();
        }}
      >
        {children}
      </div>
    </NavContext>
  );
}

interface NavDropdownProps {
  id: string;
  label: string;
  children: ReactNode;
}

/** A top-level item whose panel is a full-width dropdown on desktop and an accordion in the drawer. */
export function NavDropdown({ id, label, children }: NavDropdownProps) {
  const { openPanel, setOpenPanel, hoverPanel } = useNav();
  const open = openPanel === id;

  function onHover(event: PointerEvent, next: string | null) {
    if (isDesktopMouse(event.pointerType)) hoverPanel(next);
  }

  return (
    <li
      className="border-b border-border lg:flex lg:border-0"
      onPointerEnter={(event) => onHover(event, id)}
      onPointerLeave={(event) => onHover(event, null)}
    >
      <button
        type="button"
        id={triggerId(id)}
        aria-expanded={open}
        aria-controls={panelId(id)}
        onClick={(event) => {
          // Hover has usually opened the panel already, so a desktop mouse click keeps it open.
          // Keyboard (pointerType "") and touch clicks toggle.
          const { pointerType } = event.nativeEvent as globalThis.PointerEvent;
          setOpenPanel(isDesktopMouse(pointerType) || !open ? id : null);
        }}
        className="flex w-full items-center justify-between gap-1 py-3 font-medium lg:w-auto lg:border-b-2 lg:border-transparent lg:py-0 lg:aria-expanded:border-foreground"
      >
        {label}
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
      <div
        id={panelId(id)}
        hidden={!open}
        className="pb-4 lg:absolute lg:inset-x-0 lg:top-full lg:z-20 lg:border-b lg:border-border lg:bg-background lg:pb-0 lg:shadow-sm"
      >
        {children}
      </div>
    </li>
  );
}
