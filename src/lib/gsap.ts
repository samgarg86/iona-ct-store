"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once; client components import GSAP from here rather than from "gsap"
gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

/**
 * Media queries for a Tailwind breakpoint, read from the theme so `gsap.matchMedia()` switches at
 * the same width as the `md:`-style variants. The breakpoint must be declared in `@theme static`.
 */
export function breakpointQueries(name: string): { above: string; below: string } {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--breakpoint-${name}`).trim();
  if (!value) {
    throw new Error(`--breakpoint-${name} is not defined. Declare it in the @theme static block in globals.css.`);
  }
  // Range syntax, like Tailwind's own variants, so there is no gap between the two queries
  return { above: `(width >= ${value})`, below: `(width < ${value})` };
}
