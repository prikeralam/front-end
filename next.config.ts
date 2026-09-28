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
    // The actions cap files at 10 MB, so this leaves room for the form fields around one.
    serverActions: { bodySizeLimit: "11mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // The backend's seeded person photos point at the deployed site's own /public files.
      { protocol: "https", hostname: "pri-website-pink.vercel.app" },
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
