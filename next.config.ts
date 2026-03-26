// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     serverActions: {
//       bodySizeLimit: '2mb',
//     },
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//       },
//     ],
//   },
//   /* config options here */
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "d34rw2rmmwyzdi.cloudfront.net" },
      { protocol: "https", hostname: "d3gj7dgsk3dlhn.cloudfront.net" },
      { protocol: "https", hostname: "therakonnect-storage.s3.us-east-1.amazonaws.com" },
      // allow any cloudfront subdomain as fallback
      { protocol: "https", hostname: "*.cloudfront.net" },
    ],
  },
};

export default nextConfig;
