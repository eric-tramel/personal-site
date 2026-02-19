import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const lines = posts.map((post) => {
    const d = post.data.date;
    const formatted = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).replace(',', '');
    return `- **${formatted}** — [${post.data.title}](/blog/${post.id}/) ([md](/blog/${post.id}.md))`;
  });

  const content = `---
title: "Blog"
---

# Blog

${lines.join('\n')}
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
