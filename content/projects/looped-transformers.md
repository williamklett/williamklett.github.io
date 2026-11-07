---
title: Looped transformers
year: 2026
order: 3
featured: true
description: >-
  There was lots of talk about OpenAI using looped transformers, and the dangers that causes. But I found one benefit of using them: the reasoning surface was also the output surface, meaning I could optimize against cheating signals in latent space, and the model could not obfuscate my monitor by distorting activation space (it is constrained by the decoder).
---
[Paper and code](https://github.com/williamklett/looped-readout-monitoring)
