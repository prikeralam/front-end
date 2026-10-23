import { describe, expect, it } from "vitest";
import { menuPlacement } from "./menuPlacement";

const viewport = { width: 1200, height: 800 };

describe("menuPlacement", () => {
  it("opens below the button when there is room, right-aligned with it", () => {
    expect(menuPlacement({ top: 100, bottom: 130, right: 1100 }, viewport, 3)).toEqual({ position: "fixed", right: 100, top: 134 });
  });

  it("opens above a button near the bottom of the screen (#246)", () => {
    expect(menuPlacement({ top: 740, bottom: 770, right: 1100 }, viewport, 3)).toEqual({ position: "fixed", right: 100, bottom: 64 });
  });

  it("stays below when there is even less room above", () => {
    expect(menuPlacement({ top: 20, bottom: 50, right: 1100 }, { width: 1200, height: 120 }, 5)).toMatchObject({ top: 54 });
  });
});
