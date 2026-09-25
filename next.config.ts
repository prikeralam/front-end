import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const apiUrl = new URL(process.env.API_URL ?? "http://localhost:8000");

const nextConfig: NextConfig = {
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
    ],
    // The image optimizer refuses loopback hosts by default; the local backend lives on localhost.
    ...(isDev ? { dangerouslyAllowLocalIP: true } : {}),
  },
};

export default nextConfig;
