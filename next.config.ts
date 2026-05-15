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
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "d34rw2rmmwyzdi.cloudfront.net" },
      { protocol: "https", hostname: "d3gj7dgsk3dlhn.cloudfront.net" },
      { protocol: "https", hostname: "therakonnect-storage.s3.us-east-1.amazonaws.com" },
      // allow any cloudfront subdomain as fallback
      { protocol: "https", hostname: "*.cloudfront.net" },
      // Local dev backend on LAN — uploads served directly off the API host.
      // { protocol: "http", hostname: "172.16.1.47", port: "5000" },
      // { protocol: "http", hostname: "localhost", port: "5000" },
      // { protocol: "http", hostname: "127.0.0.1", port: "5000" },
    ],
  },
};

export default nextConfig;
