import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const pubtypeOrder = ["talk", "preprint", "book", "chapter", "article", "patent", "conf"] as const;
const pubtypeLabels: Record<string, string> = {
  talk: "Talks",
  preprint: "Preprints",
  book: "Books",
  chapter: "Book Chapters",
  article: "Journal Articles",
  patent: "Patents",
  conf: "Conference Papers",
};

export const GET: APIRoute = async () => {
  const pubs = await getCollection("publications");

  const sections: string[] = [];

  for (const pt of pubtypeOrder) {
    const items = pubs
      .filter((p) => p.data.pubtype === pt)
      .sort((a, b) => b.data.year - a.data.year);

    if (items.length === 0) continue;

    const heading = `## ${pubtypeLabels[pt]}`;
    const entries = items.map((pub) => {
      const star = pub.data.star ? '\u2605 ' : '';
      return `- ${star}${pub.data.authors}, "[${pub.data.title}](/publications/${pub.id}/)" ([md](/publications/${pub.id}.md)), *${pub.data.in}*, ${pub.data.year}.`;
    });

    sections.push(`${heading}\n\n${entries.join('\n')}`);
  }

  const content = `---
title: "Publications"
---

# Publications

${sections.join('\n\n')}
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
