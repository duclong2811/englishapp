import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vở tiếng Anh",
    short_name: "Vở tiếng Anh",
    description: "Học tiếng Anh mỗi ngày: bài học, từ vựng và luyện nói với AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcfe",
    theme_color: "#fbfcfe",
    lang: "vi",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
