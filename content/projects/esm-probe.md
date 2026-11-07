---
title: ESM probe
year: 2026
order: 2
featured: true
category: Computational biology
status: Research project
blurb: Reading viral-origin signals from a frozen protein language model.
tags: [ESM3, Linear probes, Representation analysis]
links:
  - { label: Related Foldguard demo, url: "https://williamklett.github.io/foldguard-model-generator-demo/index.html" }
  - { label: Discuss this project, url: "mailto:wk2617@princeton.edu?subject=ESM%20probe%20project" }
---
## What does a protein model already know?

This project asks whether a simple linear readout can recover viral-versus-cellular origin from frozen ESM3-open representations. The backbone weights stay fixed. The experiment changes which internal coordinates the readout can use.

## Looking across layers

The largest readout uses 1,536 residue-mean residual coordinates from each of 48 transformer blocks: 73,728 features in total. Smaller readouts use 256 or 1,024 selected coordinates. Reducing the head size does not remove the cost of running the full ESM3 backbone.

The homepage explorer compares four fitted readouts on the same recorded TEST benchmark. It switches between the full benchmark, viral-versus-human, and difficult natural cellular controls. These are recorded results, not model inference in your browser.

| Readout | Full benchmark AUROC | Viral vs human | Difficult cellular |
| --- | --- | --- | --- |
| Final layer | 0.990701 | 0.962287 | 0.946360 |
| 256 coordinates | 0.988812 | 0.942236 | 0.938072 |
| 1,024 coordinates | 0.992759 | 0.953230 | 0.959428 |
| All 48 layers | 0.993626 | 0.967168 | 0.963647 |

## What these numbers establish

They show strong separation on this benchmark under its original paired-batch extraction policy. The full TEST set contains 1,046 viral and 1,034 cellular proteins. The human and difficult-control panels contain only 38 and 121 negatives, respectively, and improvement intervals on those panels include zero.

The benchmark was repeatedly inspected, and homology independence has not been independently verified. These results are not a state-of-the-art claim or a demonstration of generalization to unseen protein families.

This is an origin classifier. It does not estimate pathogenicity, virulence, host range, or transmission. A sigmoid readout is not automatically a calibrated probability.

## Context and related work

The benchmark is from Bigot et al., [*Viral Proteins Reveal Geometry of Protein Language Models*](https://arxiv.org/abs/2606.12609v1). The related Foldguard demo presents a protein-annotation workspace; it is a separate interface, not a reproduction of the comparison above. The probe code is currently private.
