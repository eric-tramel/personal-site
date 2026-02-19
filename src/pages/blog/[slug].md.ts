import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { post } = props as { post: any };
  const { title, date, description, tags, author, draft } = post.data;

  // Reconstruct frontmatter from parsed data for a clean, canonical output
  const fmLines = [
    '---',
    `title: "${title}"`,
    `date: ${date.toISOString().split('T')[0]}`,
    `description: "${description}"`,
    `tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]`,
    `author: ${author}`,
    ...(draft ? [`draft: ${draft}`] : []),
    '---',
  ];

  const content = `${fmLines.join('\n')}\n\n${post.body}`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
