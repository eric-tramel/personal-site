---
title: "Synthetic Data Powering Pretraining"
pubtype: talk
year: 2026
authors: Eric W. Tramel
in: "UC Berkeley EE 194/290: Scalable AI (Berkeley, USA)"
star: true
link: "http://scalable-ai.eecs.berkeley.edu/"
linkslides: "/assets/doc/synthetic-data-powering-pretraining-berkeley-2026.pdf"
abstract: >-
  Invited lecture for UC Berkeley EE 194/290 on how synthetic data is reshaping
  modern LLM pretraining. The talk covers the data wall, scaling pressures, practical
  synthetic-data pipelines, and current evidence on where synthetic pretraining helps
  most (and where it still fails).
---

## Summary

This lecture argues that web-only pretraining is approaching limits, but pretraining
itself is not over. The key lever is synthetic data designed as a training curriculum.

### Topics covered

- Why inference economics and overtraining behavior create pressure for larger and more novel token pools.
- How synthetic data is being used in large-scale pretraining today, including rephrasing, capability seeding, and verification loops.
- Evidence from recent open and industry studies on code and reasoning data mixed directly into pretraining.
- Open problems: quality control, evaluation infrastructure, and agent-trajectory data at scale.
