import { describe, expect, it } from "vitest";
import { isPlainClick } from "./plainClick";

const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };

describe("isPlainClick", () => {
  it("opens the pop-up only for an unmodified left click", () => {
    expect(isPlainClick(click)).toBe(true);
  });

  it("leaves new-tab, new-window and middle clicks to the browser", () => {
    expect(isPlainClick({ ...click, ctrlKey: true })).toBe(false);
    expect(isPlainClick({ ...click, metaKey: true })).toBe(false);
    expect(isPlainClick({ ...click, shiftKey: true })).toBe(false);
    expect(isPlainClick({ ...click, altKey: true })).toBe(false);
    expect(isPlainClick({ ...click, button: 1 })).toBe(false);
  });
});
