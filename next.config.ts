import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app. Without it, Turbopack walks up and
  // finds a stray parent lockfile (~/package-lock.json) and warns. As a sibling
  // repo this directory is self-contained, so it is the correct root.
  turbopack: {
    root: __dirname,
  },
  // The Buy/Rent split re-homed the old single-track routes under /buy. Keep a
  // permanent (308) redirect so the old /mortgage bookmark still lands. The root
  // "/" is intentionally NOT redirected here: it is a small client page that
  // reopens on the last-active track (which a static redirect can't read).
  async redirects() {
    return [{ source: "/mortgage", destination: "/buy/mortgage", permanent: true }];
  },
};

export default nextConfig;
