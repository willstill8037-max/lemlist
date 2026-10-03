# Vidéo de référence (non versionnée)

Placer ici le fichier fourni `lemlist_1080p.mp4` (H.264 1920×1080 60 fps,
3 099 images, AAC stéréo 48 kHz, 51,65 s, ~18 Mo) puis lancer :

```bash
./scripts/extract-reference.sh            # -> reference/frames/f00000.jpg … f03098.jpg
```

Les images sont indexées à partir de 0 : `fNNNNN.jpg` = instant NNNNN/60 s.
Ces fichiers sont ignorés par Git (`.gitignore`) : ils ne servent qu'à
l'analyse (`tools/`) et à la comparaison (`scripts/compare.mjs`,
`tools/fidelity_metrics.py`). La reconstruction elle-même n'en dépend pas.
