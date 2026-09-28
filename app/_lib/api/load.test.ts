import { describe, expect, it, vi } from "vitest";
import { DynamicServerError } from "next/dist/client/components/hooks-server-context";
import { load } from "./load";

describe("load", () => {
  it("returns the data on success", async () => {
    await expect(load("people", async () => [1, 2])).resolves.toEqual({ ok: true, data: [1, 2] });
  });

  it("turns an ordinary failure into an error state", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(load("people", async () => { throw new Error("backend down"); })).resolves.toEqual({ ok: false });
    log.mockRestore();
  });

  it("lets Next's render-per-request signal through instead of rendering an error state", async () => {
    const signal = new DynamicServerError("connection() during prerender");
    await expect(load("people", async () => { throw signal; })).rejects.toBe(signal);
  });
});
