/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    turbopackPluginRuntimeStrategy: "workerThreads",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vrapmahhtmhflaqbubux.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
        search: "",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/admin/login",
          destination: "/admin",
        },
        {
          source: "/staff/:path((?!login|invitation).*)",
          destination: "/admin/:path*",
        },
      ],
    };
  },
};

export default nextConfig;