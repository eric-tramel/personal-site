import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const content = `---
title: "About"
---

# About

## Academic Bio

I received my B.S. and Ph.D. degrees from Mississippi State University, both with distinctions, in 2007 and 2012, respectively. I conducted my dissertation work under the direction of Prof. James E. Fowler on the application of compressed sensing techniques to high-dimensional media, e.g. natural video, multiview image and video, light-field images, and hyperspectral imagery for geosciences. During my Ph.D. studies, I also worked as a research intern for Canon USA, Inc.'s research division in San Jose, CA, where my work lead to a patent for a novel lightfield acquisition system, for which I am listed as a co-inventor.

After finishing my graduate studies, in 2013 I started a postdoctoral research position at Ecole Normale Superieure (ENS) in the SPHINX group of Prof. Florent Krzakala. During this fruitful post-doc, I focused my work mainly on the intersection of statistical physics and information problems, specifically, signal processing and machine learning. During my postdoc, I authored a number of works on this subject, including works presented at both ICML and NIPS, and edited a notable book on the same topic.

Following my academic work, I transitioned to industry roles focusing on applied machine learning and AI research. I've had the privilege of working across diverse organizations spanning technology companies, AI startups, and leading research institutions, contributing to advances in synthetic data generation, federated learning, clinical AI, and large language models.

## Professional Experience

| Company | Role |
|---------|------|
| NVIDIA | Principal Research Scientist |
| Gretel.ai | Staff Research Scientist |
| Unlearn.ai | ML Lead |
| Amazon Alexa | Applied Scientist II |
| Owkin | Senior Research Scientist |
| ENS | Postdoctoral Researcher |
| INRIA | Postdoctoral Researcher |
| ESPCI | Visiting Researcher |
| Canon | Research Intern |
| MSU | Ph.D. Student |
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
