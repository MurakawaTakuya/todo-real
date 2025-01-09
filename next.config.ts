import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest.json$/],
});

const nextConfig = withPWA({
  output: "export",
  trailingSlash: true,
  sassOptions: {
    includePaths: ["./src/styles"],
  },
  images: {
    unoptimized: true,
  },
});

export default nextConfig;
