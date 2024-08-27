import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Match any hostname
      },
      {
        protocol: "http",
        hostname: "**", // Match any hostname
      },
    ],
  },
};

export default withNextIntl(nextConfig);
