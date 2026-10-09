"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MEASURE_REQUEST, STORY_SANDBOX, parseStoryMessage, wrapStoryHtml } from "../../_lib/storyFrame";

/** Space kept above an in-story anchor when the page scrolls to it, for the sticky site header. */
const HEADER_OFFSET = 96;

/** The nearest scrolling ancestor (the dashboard's preview dialog), or null when the page itself scrolls. */
function scrollBox(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
  }
  return null;
}

/** Scrolls whatever contains the frame so that a point `offset` pixels into the story sits just below the top. */
function scrollToStoryOffset(el: HTMLElement, offset: number) {
  const box = scrollBox(el);
  if (box) box.scrollTo({ top: el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop + offset - 16, behavior: "smooth" });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset - HEADER_OFFSET, behavior: "smooth" });
}

/** Asks the story for its height. The frame's origin is opaque, so "*" is the only target that reaches it; the request carries nothing private. */
function askHeight(el: HTMLIFrameElement | null) {
  el?.contentWindow?.postMessage(MEASURE_REQUEST, "*");
}

/**
 * An uploaded data story, isolated in a sandboxed iframe (see `_lib/storyFrame.ts`). The frame grows to the story's
 * height, so the page scrolls as one, and in-story anchor links scroll the page.
 */
export default function StoryFrame({ html, title, className = "" }: { html: string; title: string; className?: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const srcDoc = useMemo(() => wrapStoryHtml(html), [html]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const el = frame.current;
      // A sandboxed frame without same-origin access always reports the opaque origin "null".
      if (!el || event.source !== el.contentWindow || event.origin !== "null") return;
      const message = parseStoryMessage(event.data);
      if (!message) return;
      if (message.kind === "height") setHeight(message.value);
      else scrollToStoryOffset(el, message.value);
    }
    window.addEventListener("message", onMessage);
    askHeight(frame.current);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={frame}
      title={title}
      srcDoc={srcDoc}
      sandbox={STORY_SANDBOX}
      referrerPolicy="no-referrer"
      onLoad={(e) => askHeight(e.currentTarget)}
      // Until the story reports its height, hold a screen's worth of space so the page doesn't jump twice.
      style={{ height: height ?? 800 }}
      className={`block w-full border-0 bg-white ${height === null ? "animate-pulse" : ""} ${className}`}
    />
  );
}
