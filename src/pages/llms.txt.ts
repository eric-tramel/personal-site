import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://eric-tramel.github.io';

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const pubs = await getCollection("publications");
  pubs.sort((a, b) => b.data.year - a.data.year);

  const blogLines = posts.map((post) =>
    `- [${post.data.title}](${SITE}/blog/${post.id}.md): ${post.data.description}`
  );

  const pubLines = pubs.map((pub) =>
    `- [${pub.data.title}](${SITE}/publications/${pub.id}.md): ${pub.data.authors}, *${pub.data.in}*, ${pub.data.year}.`
  );

  const content = `# Eric W. Tramel

> Personal site of Eric W. Tramel, Ph.D. — Principal Research Scientist at NVIDIA. Research in synthetic data generation, federated learning, and the intersection of statistical physics and machine learning.

Eric's site includes a blog on ML engineering and agent tooling, a full academic publication list, and a professional bio.

## Blog

${blogLines.join('\n')}

## Publications

- [All Publications](${SITE}/publications/index.md): Complete bibliography grouped by type (talks, preprints, books, chapters, articles, patents, conference papers)

## About

- [About](${SITE}/about.md): Academic bio and professional experience

## Optional

- [Blog Index](${SITE}/blog/index.md): Full listing of all blog posts with dates
${pubLines.join('\n')}
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
