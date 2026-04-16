import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TheraKonnect",
    short_name: "TheraKonnect",
    description:
      "Book verified therapists in Pakistan — online or in-clinic mental health sessions.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1120",
    theme_color: "#1a56db",
    categories: ["health", "medical", "lifestyle"],
    lang: "en",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/opengraph-image",
        sizes: "1200x630",
        type: "image/png",
      },
    ],
  };
}
