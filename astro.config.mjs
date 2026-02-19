// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://eric-tramel.github.io',
  redirects: {
    '/searchable-agent-memory': '/blog/2026-02-07-searchable-agent-memory/',
    '/searchable-agent-memory/': '/blog/2026-02-07-searchable-agent-memory/',
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'css-variables',
    },
  },
});
