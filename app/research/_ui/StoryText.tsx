import type { ReactNode } from "react";
import type { StoryTextBlock } from "../../_lib/storyText";

/**
 * The plain-text version of an uploaded data story, under its frame: closed by default, but part of the page itself,
 * so search engines read the story's words as this page's and readers without JavaScript (or a screen reader that
 * skips the frame) still get the text. Consecutive list items become one list.
 */
export default function StoryText({ blocks }: { blocks: StoryTextBlock[] }) {
  const content: ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.kind === "item") {
      const items: string[] = [];
      while (i < blocks.length && blocks[i].kind === "item") items.push(blocks[i++].text);
      i--;
      content.push(
        <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5">
          {items.map((text, j) => <li key={j}>{text}</li>)}
        </ul>,
      );
    } else if (block.kind === "heading") {
      content.push(<h2 key={i} className="mt-8 text-[19px] font-semibold tracking-tight text-[#171a2b] first:mt-0">{block.text}</h2>);
    } else if (block.kind === "subheading") {
      content.push(<h3 key={i} className="mt-6 text-[16px] font-semibold text-[#171a2b] first:mt-0">{block.text}</h3>);
    } else {
      content.push(<p key={i} className="mt-3 first:mt-0">{block.text}</p>);
    }
  }

  return (
    <details className="group mt-10 rounded-lg border border-[#e6e8f0] bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[14.5px] font-semibold text-[#171a2b] [&::-webkit-details-marker]:hidden">
        Read this story as text
        <span aria-hidden="true" className="text-[20px] font-normal leading-none text-[#253D9A] transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-[#e6e8f0] px-5 pb-6 pt-5 text-[15px] leading-relaxed text-[#4b4f66]">
        <p className="mb-5 text-[13px] text-[#8b8fa3]">The story&rsquo;s words without its charts.</p>
        {content}
      </div>
    </details>
  );
}
