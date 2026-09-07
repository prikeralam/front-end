const map: Record<string, string> = {
  square: "aspect-square",
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
  "3:4": "aspect-[3/4]",
};

export const ratioClass = (ratio: string) => map[ratio] ?? "aspect-video";
