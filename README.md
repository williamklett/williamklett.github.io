# William Klett

Personal site: https://williamklett.github.io

```sh
python -m pip install -r requirements.txt
python build.py
python -m http.server 8077 --directory dist
```

The existing GitHub Actions workflow builds `dist/` and deploys to GitHub Pages. No custom domain is configured or emitted.

## Content

- Kalshi: SWIM/DATIS → colocated machine → trading desk; an illustrative animation of market-maker bid/ask quotes, a fair-price estimate, and a stale-quote fill. The displayed $150 → $8,000 in two months and 3,000+ settled trades are transcribed from the user's one-page résumé, not computed from the animation.
- ESM: geometric ESMFold probe, original fixed-camera video exports, and a link to the author's write-up. These show decoded distance-map embeddings across depth, not physical molecular trajectories. Animation provenance and checksums are in `static/media/provenance.json`.
- Looped transformers: illustrative random-stopping diagram and public paper/code link.

`content/site.md` and `content/projects/` hold text. `templates/demos/` holds the project panels; `static/site.js` handles interaction. The prior Blue Shift page remains at its existing URL. Python dependencies are build-time only.

Keyboard-accessible tabs, native video controls, reduced-motion support, and relative asset paths are retained. Videos are only fetched as needed; they do not autoplay. The market animation pauses outside the visible panel and honors reduced-motion preferences.
