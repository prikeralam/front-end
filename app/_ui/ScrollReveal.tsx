"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Top-level sections, and the cards inside any grid (people, research, events, datasets). */
const TARGETS = "main > section, main section .grid > *";
/** Cards in one row rise one after another. */
const STAGGER_MS = 70;
const ROW = 4;

/**
 * Lets the public pages' sections and cards rise into place as they scroll into view. Only elements that start below
 * the current screen are marked, and only from script, so the first screen is never hidden and a page without
 * JavaScript shows everything. Skipped under reduced motion, on the dashboard and on the homepage.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    // The homepage (and its redesign previews) stays still on purpose.
    if (pathname.startsWith("/dashboard") || pathname === "/account" || pathname === "/" || pathname.startsWith("/home-preview")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const below = (el: HTMLElement) => el.getBoundingClientRect().top > window.innerHeight;
    const targets: HTMLElement[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(TARGETS)) {
      if (el.dataset.reveal || !below(el)) continue;
      // A card inside a section that is itself rising already moves with it.
      if (targets.some((t) => t.contains(el))) continue;
      targets.push(el);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "in";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of targets) {
      const index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      if (el.parentElement?.classList.contains("grid")) el.style.transitionDelay = `${(index % ROW) * STAGGER_MS}ms`;
      el.dataset.reveal = "pending";
      observer.observe(el);
    }
    return () => {
      observer.disconnect();
      // Never leave anything hidden if the page changes before it was reached.
      for (const el of targets) if (el.dataset.reveal === "pending") el.dataset.reveal = "in";
    };
  }, [pathname]);

  return null;
}
