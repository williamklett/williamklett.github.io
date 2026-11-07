# William Klett

Personal site: https://williamklett.github.io

```sh
python -m pip install -r requirements.txt
python build.py
python -m http.server 8077 --directory dist
```

GitHub Actions builds `dist/` and deploys to GitHub Pages. No custom domain is configured or emitted.

## Site

The homepage is an index of three animated project links. Each opens a keyboard-accessible dialog; ordinary project URLs remain available without JavaScript. Descriptions live in `content/projects/*.md`, panels in `templates/demos/`, and landing animations in `templates/previews/`.

- Kalshi: the SWIM/DATIS information race through parallel colocated workers to the trading desk. Prices and timing are schematic. Account growth of $150 → $8,000 in two months and 3,000+ settled trades come from the résumé.
- ESM: rotatable, zoomable layerwise geometry from the original T1137s4 and 8FMI MDS PDB stacks, each with 47 layers. Layer scrubbing and a final-layer outline use the saved coordinates. Continuous motion interpolates layers; these are decoded geometric representations, not physical molecular trajectories. Original videos remain downloadable.
- Looped transformers: actual fixed/random-stopping and no-audit chess evaluation replays. All 32 held-out positions, three seeds, and 16 saved rollouts per condition are included. Earlier audited proposals do not move pieces; only execution changes the board. Summary bounds and selected-seed outcomes use the published family-weighted results, including rejected commands. The homepage preview uses the first saved seed-43 rollout for test position 1 under each primary condition.

Geometry and replay data are fetched on demand. Decorative motion honors reduced-motion preferences; interactive playback can be controlled explicitly. Background and hidden animations pause. No runtime framework or third-party browser requests are needed.

## Data provenance

`static/media/provenance.json` identifies the original video and geometry assets. Geometry JSON files preserve the source PDB hash and alignment method; replay JSON preserves all nine source-file hashes and the family-report hash. Source chess files were verified byte-for-byte against the public research repository.

The export scripts accept local source paths explicitly:

```sh
python scripts/export-protein-geometry.py INPUT.pdb OUTPUT.json --name NAME
python scripts/export-chess-replays.py RELEASE_ROOT OUTPUT.json
```

Only the geometry exporter requires NumPy. Exported data is committed; ordinary site builds do not require it. `static/market.js`, `static/protein-viewer.js`, `static/chess.js`, and `static/gallery.js` own their respective animations. The prior Blue Shift page remains at its existing URL.
