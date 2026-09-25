import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Changueada",
    short_name: "La Changueada",
    description:
      "Historial, estadísticas, ranking y handicap de La Changueada.",
    start_url: "/",
    display: "standalone",
    background_color: "#052e16",
    theme_color: "#052e16",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "1254x1254",
        type: "image/png",
      },
    ],
  };
}