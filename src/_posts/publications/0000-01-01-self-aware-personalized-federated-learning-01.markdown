---
title: "Self-aware personalized federated learning"
jemoji: ":star:"
layout: publication
category: publication
pubtype: conf
date: 2022-01-01
tag:
    - publication
    - machine learning
    - federated learning
    - NeurIPS
authors: "Huili Chen & Jie Ding & Eric W Tramel & Shuang Wu & Anit Kumar Sahu & Salman Avestimehr & Tao Zhang"
in: "Advances in Neural Information Processing Systems (NeurIPS)"
year: 2022
citations: 34
link: "https://proceedings.neurips.cc/paper_files/paper/2022/hash/8265d7bb2db42e86637001db2c46619f-Abstract-Conference.html"
abstract: >
    In the context of personalized federated learning (FL), the critical challenge is to balance local model improvement and global model tuning when the personal and global objectives may not be exactly aligned. Inspired by Bayesian hierarchical models, we develop a self-aware personalized FL method where each client can automatically balance the training of its local personal model and the global model that implicitly contributes to other clients' training. Such a balance is derived from the inter-client and intra-client uncertainty quantification. A larger inter-client variation implies more personalization is needed. Correspondingly, our method uses uncertainty-driven local training steps an aggregation rule instead of conventional local fine-tuning and sample size-based aggregation. With experimental studies on synthetic data, Amazon Alexa audio data, and public datasets such as MNIST, FEMNIST, CIFAR10, and Sent140, we show that our proposed method can achieve significantly improved personalization performance compared with the existing counterparts.
---
