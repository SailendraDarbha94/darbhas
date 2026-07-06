import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@darbha/ui", "@darbha/types"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
