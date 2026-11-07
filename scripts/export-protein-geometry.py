"""Export an existing layerwise MDS PDB stack for the browser (requires numpy).

Usage: python scripts/export-protein-geometry.py INPUT.pdb OUTPUT.json --name NAME
Uses the same final-frame Kabsch alignment as render_mds_pdb_stack_video.py.
"""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np

p = argparse.ArgumentParser()
p.add_argument("input", type=Path)
p.add_argument("output", type=Path)
p.add_argument("--name", required=True)
args = p.parse_args()
layers, frames, coords = [], [], []
for line in args.input.read_text().splitlines():
    if line.startswith("MODEL"):
        layers.append(int(line.split()[-1]))
        coords = []
    elif line.startswith("ATOM"):
        coords.append([float(line[a:b]) for a, b in ((30, 38), (38, 46), (46, 54))])
    elif line.startswith("ENDMDL"):
        frames.append(coords)
raw = np.asarray(frames, dtype=float)
assert raw.ndim == 3 and raw.shape[-1] == 3 and np.isfinite(raw).all()
target = raw[-1] - raw[-1].mean(axis=0)
aligned = []
for frame in raw:
    centered = frame - frame.mean(axis=0)
    u, _, vt = np.linalg.svd(centered.T @ target)
    rot = u @ np.diag([1., 1., np.sign(np.linalg.det(u @ vt))]) @ vt
    aligned.append(centered @ rot)
aligned = np.asarray(aligned)
# Rigid alignment preserves the decoded geometry; rounding retains PDB precision.
assert np.allclose(np.linalg.norm(np.diff(raw, axis=1), axis=2),
                   np.linalg.norm(np.diff(aligned, axis=1), axis=2), atol=1e-8)
data = {
    "name": args.name, "layers": layers, "residueCount": raw.shape[1],
    "radius": round(float(np.linalg.norm(aligned, axis=2).max()), 3),
    "coordinates": np.round(aligned, 3).tolist(),
    "provenance": {
        "source": args.input.name, "sourceSha256": hashlib.sha256(args.input.read_bytes()).hexdigest(),
        "representation": "Classical MDS of decoded probe distance maps; C-alpha trace",
        "alignment": "Rigid Kabsch alignment of each layer to the final layer, centered at origin",
        "interpolation": "Linear between measured layers; display only"
    }
}
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(data, separators=(",", ":")) + "\n")
print(f"{args.name}: {len(layers)} layers, {raw.shape[1]} residues, {args.output.stat().st_size} bytes")
