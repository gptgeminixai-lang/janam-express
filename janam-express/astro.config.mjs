import { defineConfig } from 'astro/config';

// When deployed to GitHub Pages the site lives under /janam-express/.
// The deploy workflow sets PUBLIC_BASE; local dev stays at the root.
export default defineConfig({
  site: 'https://gptgeminixai-lang.github.io',
  base: process.env.PUBLIC_BASE || '/',
  server: { port: 4321 },
});
