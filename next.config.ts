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
    domains: ["images.remotePatterns"],
    remotePatterns: [
      { protocol: "https", hostname: "d3gj7dgsk3dlhn.cloudfront.net" },
      // if you still have some S3 absolute URLs in old records:
      { protocol: "https", hostname: "therakonnect-storage.s3.us-east-1.amazonaws.com" },
    ],
  },
};

export default nextConfig;
