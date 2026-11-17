/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    turbopackPluginRuntimeStrategy: "childProcesses",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "previewengine-accl.zoho.in",
      },
      {
        protocol: "https",
        hostname: "previewengine-accl.zohoexternal.in",
      },
      {
        protocol: "https",
        hostname: "**.zoho.in",
      },
      {
        protocol: "https",
        hostname: "**.zohoexternal.in",
      },
      {
        protocol: "https",
        hostname: "wbegixswinshimuziyum.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "vrapmahhtmhflaqbubux.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "dwulwgsulbqjxvtozkqw.supabase.co",
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