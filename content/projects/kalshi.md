---
title: Kalshi
year: 2026
order: 1
featured: true
category: Markets & systems
status: Independent project
blurb: Studying how information moves through prediction markets.
tags: [Market microstructure, Event-driven systems, Python]
links:
  - { label: Discuss this project, url: "mailto:wk2617@princeton.edu?subject=Kalshi%20project" }
---
## From an event to a decision

A research and engineering project around prediction-market data: recording order books and trades, studying market reactions, and testing event-driven strategies. The work spans market microstructure, weather information, and the infrastructure needed to evaluate a hypothesis against recorded data.

## The central question

A price move can reflect temporary order-book pressure or lasting new information. Distinguishing those mechanisms matters: a strategy that assumes every move will reverse can fail precisely when the market has learned something real.

The interactive sketch above plants these two regimes in synthetic data. It explains the question; it is not a live feed, a backtest, or evidence of profitable trading.

## What I built

- Data recording and analysis workflows for market books and trades.
- An event-driven simulation and backtesting harness.
- Tools for examining weather signals, market responses, and execution behavior.

The simulation and backtest machinery account for trading costs and adverse fills. A successful synthetic check validates behavior under its assumptions; a real trading edge requires separate evidence from real markets.

The project code is private. Get in touch if you’d like to discuss the engineering or research.
