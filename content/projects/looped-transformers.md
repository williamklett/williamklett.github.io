---
title: Looped transformers
year: 2026
order: 3
featured: true
category: AI interpretability
status: Code & manuscript available
blurb: Tying what a monitor reads to what a model actually does.
tags: [Random stopping, Monitor evasion, Recurrent computation]
links:
  - { label: Code & evidence, url: "https://github.com/williamklett/looped-readout-monitoring" }
  - { label: Manuscript source, url: "https://github.com/williamklett/looped-readout-monitoring/blob/main/paper/native-readout-chess-revision/manuscript.tex" }
---
## Tying monitored readouts to action

A looped transformer revisits a shared computation block. If an intermediate readout is monitored but only a known final step determines the action, the model can face different incentives at monitored and executed steps.

This project studies random stopping as a constraint on that separation. Making intermediate steps eligible for execution can connect the monitored readout more closely to the action the system takes.

## Explore the mechanism

The interactive diagram compares a fixed final step with a simple random stopping schedule. With per-step stopping probability *q*, the probability of first stopping at step *t* is *q(1 − q)ᵗ⁻¹*. The sketch caps the process at eight steps and assigns all remaining probability to step eight.

That is an explanatory schedule, not an experimental result or an exact reproduction of every protocol in the paper.

## Experiments and evidence

The public release includes arithmetic and crafted chess-endgame experiments, frozen prediction files, evaluation evidence, and manuscript sources. Its analysis path verifies all 81 saved native two-digit endpoints and all 12 final chess endpoints, and regenerates the reported figures without a GPU or API key.

Arithmetic isolates a conflict between rewarded answers and penalized numeric readouts; it does not establish useful capability preservation. Chess uses crafted endgames and a weak legal-play baseline, so legal moves and rejected commands matter alongside cheating rates.

## Limits and reproducibility

Trained-policy differences do not establish uniquely stronger expected incentives: the immediate expected terms for execution and continuation audits match at stopping probability 0.5. Some follow-ups were adaptive, including selection by test error.

The released analysis can be run directly. Rerunning training additionally requires the base model, exact starting adapters, CUDA, and the matching chess engine. Publication of the repository does not retroactively preregister the experiments.

See the public repository for the full evidence, interpretation limits, asset requirements, and AI-assistance statement.
