import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Greenhouse Lab",
    short_name: "GH Lab",
    description:
      "Media pembelajaran sains interaktif tentang pemanasan global dan efek rumah kaca.",
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fcfcfd",
    theme_color: "#074ce0",
    categories: ["education"],
    icons: [
      { src: "/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon?size=512&maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Simulasi", url: "/simulasi" },
      { name: "Eksperimen", url: "/eksperimen" },
      { name: "Materi", url: "/materi" },
    ],
  };
}
