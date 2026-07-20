import type { NextConfig } from "next";
const nextConfig: NextConfig = { distDir: process.env.NEXT_DIST_DIR === "dev" ? ".next-dev" : ".next", images: { formats: ["image/avif", "image/webp"] } };
export default nextConfig;
