# William Klett — personal site

A static, interactive portfolio for Kalshi, ESM probe, and looped transformer work. Preserves the original stone-paper, serif, navy/red/lavender, procedural-glyph design. HTML is rendered at build time; small vanilla JavaScript modules enhance the project explorer.

## Build and preview

```sh
python -m pip install -r requirements.txt
python build.py
python -m http.server 8077 --directory dist
```

Open http://localhost:8077. `dist/` is the complete static output, including `.nojekyll`. The existing GitHub Pages workflow builds and deploys on pushes to `main`, retaining its custom-domain configuration.

## Edit

- `content/site.md`: name, description, and biography.
- `content/projects/*.md`: write-ups and metadata. `featured: true` includes a project in the home explorer; its slug must have a matching template in `templates/demos/`.
- `templates/demos/`: the three interactive explanations.
- `static/site.js`: tab navigation and demo state.
- `static/style.css`: responsive layout and original design palette.
- `glyph.py`: original procedural artwork generator.

The prior Blue Shift project page is retained at its existing URL but is not featured. The sample link-only entry was removed.

## Content and evidence

The Kalshi demo uses synthetic price paths to explain temporary imbalance versus lasting information. It is not a market feed or evidence of trading performance. Its description is based on the project's recording and simulation documentation; source code remains private.

The ESM chart uses recorded results from the `esm-viral-origin` handoff README for four frozen readouts under the original paired-batch extraction policy. It is not live inference. All three evaluation panels, small-negative-panel caveats, and limitations are reproduced in the write-up. The related public Foldguard demo is a separate project interface. No model weights or private project source are included.

The loop demo shows a capped geometric stopping schedule with eight steps. It illustrates the mechanism, not a reported experimental outcome. The public evidence is at https://github.com/williamklett/looped-readout-monitoring.

## Interaction and accessibility

Project tabs support arrow keys, Home, and End. Native sliders and selectors work with the keyboard. Project hashes link directly to a selected panel. Static project text remains available without JavaScript. Reduced-motion preferences disable transitions, and mobile layouts use horizontal project tabs. There are no runtime framework dependencies, tracking scripts, or external font requests.
