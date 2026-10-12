import { describe, expect, it } from "vitest";
import { aboutStats, missionTiles } from "./aboutPage";

describe("missionTiles", () => {
  it("uses the default titles by position, or a line's own Title: prefix", () => {
    expect(missionTiles(["Conduct research.", "Policy: Develop policies.", "Engage.", "Share.", "Extra."])).toEqual([
      { title: "Research", text: "Conduct research." },
      { title: "Policy", text: "Develop policies." },
      { title: "Advocacy", text: "Engage." },
      { title: "Knowledge sharing", text: "Share." },
      { title: "Focus 5", text: "Extra." },
    ]);
    expect(missionTiles(["Data: Collect it."])[0]).toEqual({ title: "Data", text: "Collect it." });
  });
});

describe("aboutStats", () => {
  it("keeps only the counts that loaded and are above zero, in a fixed order, singular for one", () => {
    expect(aboutStats({ events: 4, publications: 12, datasets: 0, projects: 1 })).toEqual([
      { value: 12, label: "Publications" },
      { value: 1, label: "Research project" },
      { value: 4, label: "Events & campaigns" },
    ]);
    expect(aboutStats({})).toEqual([]);
  });
});
