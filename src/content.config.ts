import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('erictramel'),
    draft: z.boolean().default(false),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    pubtype: z.enum(['talk', 'preprint', 'book', 'chapter', 'article', 'patent', 'conf']),
    year: z.number(),
    in: z.string(),
    star: z.boolean().default(false),
    image: z.string().optional(),
    imageCaption: z.string().optional(),
    abstract: z.string().optional(),
    bibtex: z.string().optional(),
    link: z.string().optional(),
    linkpdf: z.string().optional(),
    linkcode: z.string().optional(),
    linktalk: z.string().optional(),
    linkslides: z.string().optional(),
    linkposter: z.string().optional(),
    jemoji: z.string().optional(),
  }),
});

export const collections = { blog, publications };
