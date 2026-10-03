# Reconstruction de la vidéo motion design lemlist

Reconstruction **animée, éditable et déterministe** de la vidéo de référence
`lemlist_1080p.mp4` (1920×1080, 60 fps, 3 099 images, 51,65 s, audio AAC 48 kHz).
Chaque texte, forme, interface et mouvement est reconstruit en HTML/CSS/SVG et
piloté par une fonction `seek(t)` ; le rendu est fait image par image dans
Chromium sans aucune capture temps réel, puis assemblé avec ffmpeg et la piste
audio d'origine.

| | |
|---|---|
| Rendu final | [`renders/lemlist_reconstruction.mp4`](renders/lemlist_reconstruction.mp4) — 1920×1080, 60 fps, 3 099 images, audio source copié |
| Comparaison côte à côte | [`renders/compare_side_by_side.mp4`](renders/compare_side_by_side.mp4) (référence à gauche, reconstruction à droite, 1920×540) |
| Analyse timecodée | [`docs/ANALYSIS.md`](docs/ANALYSIS.md) |
| Timeline structurée | [`src/timeline.json`](src/timeline.json) |
| Guide des mouvements | [`docs/MOTION_GUIDE.md`](docs/MOTION_GUIDE.md) |
| Audio | [`docs/AUDIO.md`](docs/AUDIO.md) |
| Assets et provenance | [`docs/ASSETS.md`](docs/ASSETS.md) |
| Rapport de fidélité | [`docs/FIDELITY_REPORT.md`](docs/FIDELITY_REPORT.md) |

## Installation

Prérequis : Node ≥ 18, ffmpeg (avec libx264), Chromium pour Playwright.
Python 3 + `tools/requirements.txt` uniquement pour les outils d'analyse.

```bash
npm ci                                   # playwright 1.56.1 + pngjs
npx playwright install chromium          # inutile si un Chromium Playwright est déjà présent
# (variable CHROMIUM_PATH=/chemin/vers/chrome pour imposer un exécutable)

# Optionnel — vidéo de référence (non versionnée) pour comparer / analyser :
cp /chemin/lemlist_1080p.mp4 reference/ && ./scripts/extract-reference.sh
python3 -m venv .venv && .venv/bin/pip install -r tools/requirements.txt
```

## Utilisation

| Action | Commande |
|---|---|
| Prévisualisation interactive (lecture, scrub, image par image, menu des scènes, audio) | `npm run preview` puis http://127.0.0.1:8080/ |
| Une image (par index ou par temps) | `node scripts/render.mjs --frame 1234` · `node scripts/render.mjs --time 20.5` → `renders/frames/` |
| Une scène | `node scripts/render.mjs --scene s07` → `renders/scenes/s07.mp4` (audio découpé) |
| Une plage | `node scripts/render.mjs --frames 540-900` |
| Vidéo complète | `npm run render` (= `node scripts/render.mjs`) → `renders/lemlist_reconstruction.mp4` |
| Options | `--workers N` · `--no-blur` (aperçu rapide) · `--crf 16` · `--reuse` (reprend un rendu interrompu) · `--no-audio` |
| Comparer à la référence | `node scripts/compare.mjs --scene s07 --step 6` ou `--frames 100,200,300` → `renders/compare/` (mosaïques référence / reconstruction / différence / superposition + MAE) |
| Vérifier le déterminisme | `npm run check` (deux sessions, deux ordres de seek, comparaison pixel à pixel) |
| Métriques sur toute la vidéo | `python tools/fidelity_metrics.py` → `docs/analysis/fidelity_*` |
| Analyse audio | `python tools/analyze_audio.py && python tools/audio_sync_report.py` |
| Calibrer une taille de police | `node scripts/measure-text.mjs "texte" 700 100 0 --target-width 523` |

Dans la page, l'API déterministe est exposée : `window.__seek(t)`,
`window.__seekFrame(n)`, `window.__engine`. Paramètres d'URL :
`?render=1&scenes=s05,s06&f=300`.

## Où modifier quoi

| Quoi | Où |
|---|---|
| Textes (tous, découpage en mots/lignes inclus) | `src/content/texts.fr.js` |
| Ordre / début / fin des scènes, événements clés, flou de mouvement | `src/timeline.json` (en images 60 fps) |
| Timings fins et trajectoires d'une scène | tableaux en tête de `src/scenes/sNN-*.js` (`[image, valeurs…]`) |
| Couleurs globales, police | `src/theme/theme.css` ; fonds : `src/components/Background.js` (`BG`) |
| Couleurs / formes d'un élément | le composant dans `src/components/` |
| Assets (police, avatars, audio) | `assets/` (voir `docs/ASSETS.md`) |
| Courbes d'easing | `src/engine/easing.js` |

## Organisation

```
src/
  index.html, main.js        page + bootstrap (preview / render)
  timeline.json              scènes, in/out, événements, flou de mouvement
  engine/                    moteur pur fonction du temps (anim, easing, random, text, homography, dom)
  components/                éléments réutilisables paramétrés (pilule, curseur, tableaux, moustique…)
  scenes/                    21 scènes (s01…s21), une par plan/séquence de la référence
  content/texts.fr.js        tous les textes
  theme/theme.css            police + variables de couleur
assets/                      police Inter (OFL), avatars extraits, audio source
scripts/                     rendu, comparaison, déterminisme, serveur, extraction de la référence
tools/                       analyse (audio, fidélité, extraction d'avatars) en Python
docs/                        analyse, guide, audio, assets, fidélité, sorties d'analyse
renders/                     rendus (MP4 final et comparaison versionnés ; images intermédiaires ignorées)
reference/                   emplacement de la vidéo source (non versionnée)
```

## Limites connues

Voir [`docs/FIDELITY_REPORT.md`](docs/FIDELITY_REPORT.md) : en résumé, les
éléments issus de rendus 3D (anneau, cube, réveils, moustique, flamme) sont des
approximations vectorielles ; la police est un équivalent visuel (Inter) ;
l'audio est le mix original réutilisé tel quel.
