import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  transpilePackages: ["@byfm/contracts", "@byfm/domain", "@byfm/database"],
  serverExternalPackages: ["@electric-sql/pglite", "pg", "sharp"],
  async redirects() {
    return [
      { source: "/plans", destination: "/shop", permanent: true },
      { source: "/plans/:id", destination: "/shop", permanent: true },
      { source: "/about-book", destination: "/book", permanent: true },
      { source: "/about-author", destination: "/author", permanent: true },
      { source: "/blog", destination: "/journal", permanent: true },
      { source: "/pakage", destination: "/shop", permanent: true }
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : "") + "; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self'; connect-src 'self'" + (process.env.NODE_ENV !== "production" ? " ws:" : "") + "; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" }
    ] }];
  }
};
export default nextConfig;
