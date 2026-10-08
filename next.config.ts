import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const apiUrl = new URL(process.env.API_URL ?? "http://localhost:8000");
// Read at build time and baked into the image. One image is promoted from staging to production, so this lists
// every environment's media hosts (e.g. both storage buckets), comma-separated; API_URL alone cannot cover both.
const imageHosts = (process.env.IMAGE_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // Self-contained server (`node server.js`) for the Docker image deployed to EC2.
  output: "standalone",
  experimental: {
    // CMS uploads (documents, datasets) go through Server Actions; the default 1 MB limit would reject any real file.
    // The actions cap dataset files at 20 MB (others at 10 MB), so this leaves room for the form fields around one.
    serverActions: { bodySizeLimit: "21mb" },
  },
  async redirects() {
    // "Cited in" folded into the bottom of /data (2026-10-08) until it grows enough for its own page again.
    return [{ source: "/cited-in", destination: "/data#cited-in", permanent: true }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Seeded person photos used to point at the old Vercel deployment; the backend migration (website-backend #42)
      // moves them to {FRONTEND_URL}/people/..., whose hosts come from IMAGE_HOSTS. Remove once every environment has
      // run it.
      { protocol: "https", hostname: "pri-website-pink.vercel.app" },
      // Locally the seed points photos at this dev server's own /public folder.
      ...(isDev ? [{ protocol: "http" as const, hostname: "localhost", port: "3000" }] : []),
      // Media the backend serves (e.g. person photos) — in production this is the storage bucket's host, so
      // set API_URL (or add the bucket host here) per environment.
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        ...(apiUrl.port ? { port: apiUrl.port } : {}),
      },
      ...imageHosts.map((hostname) => ({ protocol: "https" as const, hostname })),
    ],
    // The image optimizer refuses loopback hosts by default; the local backend lives on localhost.
    ...(isDev ? { dangerouslyAllowLocalIP: true } : {}),
  },
};

export default nextConfig;
