import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () => {
  const pubs = await getCollection("publications");
  return pubs.map((pub) => ({
    params: { slug: pub.id },
    props: { pub },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { pub } = props as { pub: any };
  const d = pub.data;

  // Indent a multi-line string for YAML block scalar output
  const yamlBlock = (key: string, value: string) => {
    const indented = value.split('\n').map((line) => `  ${line}`).join('\n');
    return `${key}: >-\n${indented}`;
  };

  // Reconstruct frontmatter from parsed data, including only non-empty optional fields
  const fmLines = [
    '---',
    `title: "${d.title}"`,
    `authors: "${d.authors}"`,
    `pubtype: ${d.pubtype}`,
    `year: ${d.year}`,
    `in: "${d.in}"`,
  ];

  if (d.star) fmLines.push(`star: ${d.star}`);
  if (d.image) fmLines.push(`image: ${d.image}`);
  if (d.imageCaption) fmLines.push(`imageCaption: "${d.imageCaption}"`);
  if (d.abstract) fmLines.push(yamlBlock('abstract', d.abstract));
  if (d.bibtex) fmLines.push(yamlBlock('bibtex', d.bibtex));
  if (d.link) fmLines.push(`link: ${d.link}`);
  if (d.linkpdf) fmLines.push(`linkpdf: ${d.linkpdf}`);
  if (d.linkcode) fmLines.push(`linkcode: ${d.linkcode}`);
  if (d.linktalk) fmLines.push(`linktalk: ${d.linktalk}`);
  if (d.linkslides) fmLines.push(`linkslides: ${d.linkslides}`);
  if (d.linkposter) fmLines.push(`linkposter: ${d.linkposter}`);
  if (d.jemoji) fmLines.push(`jemoji: "${d.jemoji}"`);

  fmLines.push('---');

  const body = pub.body ? `\n\n${pub.body}` : '';
  const content = `${fmLines.join('\n')}${body}`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
