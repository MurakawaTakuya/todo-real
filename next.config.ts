import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  sassOptions: {
    includePaths: ["./src/styles"],
  },
};

export default nextConfig;
