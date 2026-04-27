import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg", "@prisma/client", "@prisma/adapter-pg"],
};

export default nextConfig;
