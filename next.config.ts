import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Each git worktree (incl. .ui-compare/main) must use its own Turbopack root. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
