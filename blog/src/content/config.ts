import { defineCollection, z } from 'astro:content'

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    num:      z.string(),                // '01' ~ '10'
    title:    z.string(),
    summary:  z.string(),
    cat:      z.enum(['label', 'ingredient', 'packaging', 'filing', 'cases', 'updates']),
    time:     z.number(),                // 읽는 시간(분)
    src:      z.array(z.string()),       // 기준 출처
    date:     z.string(),                // 'YYYY.MM.DD'
    featured: z.boolean().optional(),
    thumb:    z.string(),                // SVG 썸네일 종류
  }),
})

export const collections = { posts }
