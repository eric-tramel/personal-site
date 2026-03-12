# Personal Site

Astro-based personal site for Eric W. Tramel.

## Commands

Run from the repo root:

| Command | Purpose |
| --- | --- |
| `make dev` | Start the local dev server at `http://localhost:4321/` |
| `make build` | Build the static site into `dist/` |
| `make preview-publish` | Dry-run the GitHub Pages sync |
| `make publish` | Build and publish to the GitHub Pages deploy repo |

## Project Card Artwork

The `/projects` page uses hand-drawn project artwork generated with OpenAI's image API using `gpt-image-1.5`.

Final site assets live in:

- `public/assets/images/projects/`

Generated review outputs can be kept locally in:

- `output/imagegen/projects-pen/`

### Process used

1. Use the bundled image-generation CLI from the local Codex skill:
   `python "$CODEX_HOME/skills/imagegen/scripts/image_gen.py"`  
   In practice, `uv` was used so the required packages were available without changing the repo environment.
2. Generate one wide image per project with `gpt-image-1.5`, size `1536x1024`, quality `medium`.
3. Constrain every prompt to the same overall visual language:
   warm parchment paper, dark navy fountain-pen / felt-tip marker drawing, hand-drawn editorial doodle, no text, no logos, no UI mockups, no glossy rendering.
4. Make each prompt unique to the project theme:
   search rings for `moraine`, editorial markup for `slop-guard`, paper/citation forms for `zoty`, graph flow for `plait`, chart/research notation for `synthetic-pretraining-tracker`, and branching generated structure for `DataDesigner`.
5. Review the batch as a contact sheet, rename the selected outputs to stable filenames, then copy them into `public/assets/images/projects/` for site use.

### Batch generation pattern

Create a temporary JSONL file under `tmp/imagegen/`, then run:

```sh
uv run --with openai --with pillow python "$CODEX_HOME/skills/imagegen/scripts/image_gen.py" \
  generate-batch \
  --input tmp/imagegen/projects-prompts.jsonl \
  --out-dir output/imagegen/projects-pen \
  --concurrency 3
```

After reviewing the results, copy the chosen images into the public asset directory:

```sh
mkdir -p public/assets/images/projects
cp output/imagegen/projects-pen/*.png public/assets/images/projects/
```

### Prompting notes

What worked:

- "hand-drawn fountain-pen and felt-tip marker doodle on warm parchment paper"
- "editorial", "slightly imperfect", "flat scanned-paper look"
- one representative motif per project instead of a literal software interface
- strong negative constraints against dark hero art, neon, 3D rendering, dashboards, and polished vector symmetry

What did not fit the site:

- dark glossy abstractions
- UI/window mockups
- anything that felt like a dashboard screenshot or poster graphic
