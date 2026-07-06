# William Klett — personal site

A static personal website, forked from the Blue Shift aesthetic (stone
paper, Landian glyph art, serif body + monospace data, navy / arXiv-red /
lavender accents). No server at runtime — `build.py` renders everything to
`dist/`, which you host anywhere.

## Edit content

Everything is markdown. No code needed.

- **`content/site.md`** — your name, the wordmark split (`brand_first` /
  `brand_second`), tagline, links, and the intro paragraph (markdown body
  below the front-matter).
- **`content/projects/*.md`** — one file per project. Front-matter fields:
  ```yaml
  ---
  title: My Project
  year: 2026
  status: active          # optional, shows in the meta column
  order: 1                # lower = higher in the list (ties: year desc)
  blurb: One-line description shown in the list.
  tags: [tag-a, tag-b]
  links:                  # optional, shown on the detail page
    - { label: GitHub, url: "https://..." }
  url: "https://..."      # optional — used only for link-only rows
  ---

  Markdown write-up here. If there's a body, the project gets its own
  page. If the file is front-matter only, the row links straight to `url`
  (or is plain text if no url).
  ```

Add a project = drop a new `.md` in `content/projects/`. Delete one =
remove the file. Reorder = set `order:`.

## Build

```bash
pip install -r requirements.txt      # jinja2, markdown, pyyaml (build-time only)
python build.py                      # -> dist/
```

Preview locally:

```bash
cd dist && python -m http.server 8077      # open http://localhost:8077
```

## Deploy (free static hosting)

`dist/` is a complete static site (includes `.nojekyll` for GitHub Pages).

- **GitHub Pages**: push `dist/` to a `gh-pages` branch, or set Pages to
  serve from `/docs` (rename/output to `docs/`), or use a
  `username.github.io` repo and put `dist/`'s contents at the root.
- **Netlify / Vercel / Cloudflare Pages**: point at this repo, set the
  build command to `python build.py` and the publish directory to `dist`.

Paths in the generated HTML are relative, so it works whether served from
a domain root or a `/repo/` subpath.

## Aesthetic

The Landian glyph art (`dist/static/glyph-hero.svg`), the stone background
texture, and the header halftone are all generated procedurally by
`glyph.py` at build time — change the seeds/colors in `build.py` to
regenerate different art. Fonts: Orbitron (wordmark) + JetBrains Mono +
a Charter serif stack.
