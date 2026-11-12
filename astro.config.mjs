// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const socials = {
  "/github": "https://github.com/namanyt",
  "/linkedin": "https://linkedin.com/in/nityanaman",
  "/instagram": "https://instagram.com/nnthegamer",
  "/youtube": "https://www.youtube.com/@ciderboi",
  "/spotify": "https://open.spotify.com/artist/4asiCObHQTLPhbmjiqF1oi",
  "/discord": "https://discord.gg/h9ZVUrfnrx",
};

export default defineConfig({
  site: "https://ciderboi.xyz",
  devToolbar: { enabled: false },
  redirects: Object.fromEntries(
    Object.entries(socials).map(([from, to]) => [from, { destination: to, status: 308 }]),
  ),
  vite: {
    plugins: [tailwindcss()],
  },
});