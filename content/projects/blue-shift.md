---
title: Blue Shift
year: 2026
status: active
order: 1                     # lower = higher on the list (ties break by year desc)
blurb: A canonical research substrate for computational biology — fork any benchmarked method, build on it, and submit your own.
tags: [bio, infrastructure]
links:
  - { label: GitHub, url: "https://github.com/williamklett" }
---

Blue Shift is a benchmarking substrate for computational biology. It mirrors
the full [OpenProblems](https://openproblems.bio) single-cell task catalog
(batch integration, label projection, denoising, spatial, perturbation, GRN
inference, …) plus genomics and protein benchmarks, and adds the thing those
platforms don't have: a **fork-and-build-on-top** workflow.

You can fork any benchmarked method — into a browser workspace or via the
`bs` CLI — edit a section, retrain, and submit a derivative. Every submission
is sealed against a deterministic config hash, persists, and produces a
citable URL. Lineage is tracked automatically.

### What's in it

- **20 benchmarks** across single-cell, genomics, and protein, with seed
  rows mirrored from the canonical leaderboards.
- **Fork into the browser**: an in-page editor (CodeMirror) with live
  training, streamed logs, and result charts.
- **Fork in the CLI**: `bs benchmark use … && bs load … && bs train`.
- **Sealed pre-registration**, comments on every result, and a read-only
  website over the same canon.

This page is a project entry — edit `content/projects/blue-shift.md` to
change it, or delete the body to make it a link-only row.
