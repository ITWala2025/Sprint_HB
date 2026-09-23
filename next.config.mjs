/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    // Local placeholder avatars are rendered by the components themselves
    // (no remote image domains are needed at launch).
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;