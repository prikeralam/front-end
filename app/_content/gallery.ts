export type GalleryPhoto = {
  slug: string;
  caption: string;
  description: string;
  src: string;
};

// Real photographs from PRI's office inauguration and internal meetings —
// used on the Donors & Sponsors page as the Well Wishers Program gallery.
export const galleryPhotos: GalleryPhoto[] = [
  {
    slug: "inauguration",
    caption: "Office Inauguration",
    description: "Well-wishers and community leaders joined PRI for the inauguration of its office.",
    src: "/gallery/inauguration.jpg",
  },
  {
    slug: "meeting-1",
    caption: "Team in Session",
    description: "PRI's team and well-wishers in a working session at the office.",
    src: "/gallery/meeting-1.jpg",
  },
  {
    slug: "meeting-2",
    caption: "In Discussion",
    description: "A discussion with well-wishers on PRI's ongoing programmes.",
    src: "/gallery/meeting-2.jpg",
  },
];
