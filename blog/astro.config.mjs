import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://blog.krk.team',
  integrations: [
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
})
