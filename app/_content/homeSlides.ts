/**
 * The homepage slider's photographs, PRI's own (resized from `public/gallery/`). The slide text comes from the API;
 * the photos are fixed per slide so an event slide never shows a different event's picture.
 */
export const homeSlidePhotos = {
  mission: { src: "/home/mission.jpg", alt: "A meeting around the conference table at PRI's office, with the PRI mark on the wall" },
  research: { src: "/home/research.jpg", alt: "Researchers and guests in discussion at PRI's office, a printed report on the table" },
  events: { src: "/home/events.jpg", alt: "A full room at a PRI gathering, with guests standing along the windows" },
} as const;
