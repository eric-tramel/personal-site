# Astro Migration Plan: Mockup Phase

## Goal

Stand up a new Astro project that renders the latest blog post ("Searchable Agent Memory in a Single File") with full fidelity — code highlighting, correct typography, navigation, read time, author block — as a proof-of-concept before committing to a full migration.

## Why Astro

- Content Collections with Zod schema validation for structured content (blog posts, publications)
- TypeScript types generated from schemas — catches content errors at build time
- Shiki syntax highlighting built-in (fenced code blocks that actually work)
- KaTeX for math rendering via remark-math + rehype-katex
- Zero JavaScript shipped by default
- Vite-powered — instant dev server, sub-second builds
- Markdown with YAML frontmatter — existing content migrates with minimal changes
- File-based routing with clear conventions
- Tailwind CSS native integration

## Phase 1: Scaffold & Infrastructure

### 1.1 Create the Astro project

```bash
npm create astro@latest -- --template minimal personal-site-v2
cd personal-site-v2
```

Use the `minimal` template (not `blog`) to avoid inheriting opinions we don't want. We'll build our own structure.

### 1.2 Install dependencies

```bash
# Core
npx astro add tailwind

# Markdown enhancements
npm install remark-math rehype-katex katex
npm install reading-time

# RSS (for later, but install now)
npm install @astrojs/rss

# Sitemap
npx astro add sitemap
```

### 1.3 Configure astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://eric-tramel.github.io',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'nord',
    },
  },
});
```

### 1.4 Content collection schema

Create `src/content.config.ts`:

```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
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
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
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
```

Note: The publication schema intentionally mirrors the existing Jekyll frontmatter fields (`authors` as a single string, `pubtype`, `in`, `jemoji`, etc.) to minimize content migration effort. We can refine the schema later (e.g., authors as an array of objects) once everything is ported.

## Phase 2: Layout & Components

### 2.1 Directory structure

```
src/
├── content/
│   ├── blog/
│   │   └── 2026-02-07-searchable-agent-memory.md
│   └── publications/
│       └── (empty for now)
├── layouts/
│   └── BaseLayout.astro       # HTML shell, head, nav, footer
├── components/
│   ├── Nav.astro              # Navigation bar
│   ├── Footer.astro           # Footer
│   ├── BlogPost.astro         # Blog post layout wrapper
│   ├── ReadTime.astro         # Reading time display
│   ├── AuthorBlock.astro      # Author info at end of post
│   ├── RelatedPosts.astro     # Related posts by tag
│   ├── SocialLinks.astro      # Social media icons
│   └── Header.astro           # Home page header (profile, name, bio)
├── pages/
│   ├── index.astro            # Home page
│   ├── blog/
│   │   ├── index.astro        # Blog listing
│   │   └── [...slug].astro    # Individual blog posts
│   ├── about.astro            # About/Bio page (stub)
│   └── publications/
│       └── index.astro        # Publications listing (stub)
├── styles/
│   └── global.css             # Tailwind imports + global styles
└── content.config.ts
```

### 2.2 BaseLayout.astro

Responsibilities:
- HTML document structure (`<!DOCTYPE html>`, `<head>`, `<body>`)
- Meta tags (og:image, description, author)
- KaTeX CSS import (for math pages)
- Google Fonts (Roboto, Raleway, Roboto Condensed — matching current site)
- Tailwind CSS
- Nav component
- Footer component
- Slot for page content

### 2.3 Nav.astro

Two modes (matching current site behavior):
- **Home page**: Simple links (Blog, Bio, Publications) centered below header
- **Other pages**: Top bar with links on left, name + social icons + profile photo on right

Social links: Twitter/X, LinkedIn, GitHub, Google Scholar, Email

### 2.4 BlogPost.astro (layout for blog posts)

Renders:
- Title (centered, large)
- Date + read time (centered, below title, muted)
- Tags (if show-tags is enabled)
- Post content (the markdown body)
- Previous/next navigation
- Related posts
- Author block

### 2.5 ReadTime component

Calculate at build time using the `reading-time` npm package. Pass the raw markdown content to get word count and estimated minutes.

### 2.6 AuthorBlock component

Props: author key (e.g., "erictramel")
Renders: profile photo, name, bio line

Author data lives in a data file (`src/data/authors.json` or inline in the component for now).

## Phase 3: Migrate the Blog Post

### 3.1 Copy the content

Copy `2026-02-07-searchable-agent-memory.markdown` to `src/content/blog/2026-02-07-searchable-agent-memory.md`.

### 3.2 Adjust frontmatter

From (Jekyll):
```yaml
title: "Searchable Agent Memory in a Single File"
layout: post
date: 2026-02-07 00:00
tag:
  - post
  - mcp
  - bm25
  - agents
  - claude-code
category: blog
author: erictramel
description: A single-file BM25 MCP server...
```

To (Astro):
```yaml
title: "Searchable Agent Memory in a Single File"
date: 2026-02-07
tags:
  - mcp
  - bm25
  - agents
  - claude-code
author: erictramel
description: A single-file BM25 MCP server...
```

Changes: remove `layout` (handled by Astro routing), remove `category` (implicit from collection), rename `tag` -> `tags`, remove the generic "post" tag, simplify date format.

### 3.3 Content body

The markdown content should work as-is. Key things to verify:
- Fenced code blocks with language specifiers (```python, ```json, etc.) — Shiki handles these natively
- Inline code with backticks
- Links (standard markdown)
- Bold text
- Bullet lists
- No Liquid tags (this post doesn't use any — but older posts use `{% highlight %}` which will need conversion)

## Phase 4: Styling (Minimal, Functional)

### 4.1 Approach

Use Tailwind CSS with the Typography plugin (`@tailwindcss/typography`) for prose styling. This gives us excellent default formatting for markdown content (headings, paragraphs, code blocks, lists, links) without writing custom CSS.

```bash
npm install @tailwindcss/typography
```

### 4.2 Shiki theme

Use the `nord` theme to match the current site's syntax highlighting. Configure in `astro.config.mjs`.

### 4.3 What NOT to replicate yet

- Graph paper background
- Kraft paper navigation styling
- Interactive canvas drawing (coffee-painter.js)
- Complex skeuomorphic design elements
- Custom Nord SASS color variables

The mockup should be clean and readable. Design iteration comes later.

## Phase 5: Verify & Review

### 5.1 Acceptance criteria

The mockup is successful if:

1. `npm run dev` starts a local server without errors
2. The blog post renders at `/blog/2026-02-07-searchable-agent-memory/`
3. Code blocks have syntax highlighting (Python, JSON, plaintext)
4. The Nord theme is applied to code blocks
5. The title, date, and read time display correctly
6. Navigation works (Home, Blog links at minimum)
7. The blog listing page at `/blog/` shows the post
8. The content collection schema validates the frontmatter
9. `npm run build` produces a static site in `dist/`

### 5.2 Not in scope for this phase

- Full publication migration (40+ entries)
- About page content
- Math rendering verification (no math in this post)
- RSS feed
- Google Analytics
- Favicon
- Mobile responsiveness fine-tuning
- GitHub Pages deployment workflow
- Design system / visual design iteration

## Migration Path (Future Phases)

Once the mockup is approved:

1. **Phase 6**: Migrate all blog posts (convert `{% highlight %}` to fenced blocks)
2. **Phase 7**: Migrate publications (map Jekyll frontmatter to Astro schema)
3. **Phase 8**: About page, home page header, social links
4. **Phase 9**: RSS feed, sitemap, meta tags, favicon
5. **Phase 10**: GitHub Pages deployment (GitHub Actions workflow)
6. **Phase 11**: Design iteration (can run in parallel with content migration)

## File Inventory: What Carries Over

| Current (Jekyll) | New (Astro) | Notes |
|---|---|---|
| `src/_posts/blog/*.markdown` | `src/content/blog/*.md` | Frontmatter adjustment needed |
| `src/_posts/publications/*.markdown` | `src/content/publications/*.md` | Schema maps closely to existing fields |
| `src/about.md` | `src/pages/about.astro` | Markdown content in Astro page |
| `src/assets/images/*` | `public/assets/images/*` | Direct copy |
| `src/assets/doc/*` | `public/assets/doc/*` | Direct copy (PDFs) |
| `_config.yml` | `astro.config.mjs` + `src/data/site.json` | Site metadata moves to data file |

---

*Plan created: 2026-02-08*
*Framework: Astro v5.x with Tailwind CSS, Shiki, KaTeX*
*Scope: Mockup rendering one blog post as proof-of-concept*
