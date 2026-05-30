import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  site: 'https://blog.krk.team',
  integrations: [
    mdx(),
  ],
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
})
