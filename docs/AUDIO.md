# Analyse de la piste audio

**Limite importante :** l'environnement de travail ne permet pas d'écouter.
Tout ce qui suit provient de mesures techniques (ffprobe, EBU R128, STFT,
détection d'onsets par flux spectral) réalisées par `tools/analyze_audio.py`
et `tools/audio_sync_report.py`. Les natures « voix », « whoosh », « clic »
sont des **hypothèses** fondées sur le spectre, pas des constats d'écoute.

## Caractéristiques

| Mesure | Valeur |
|---|---|
| Codec | AAC-LC, stéréo, 48 kHz, ~189 kb/s |
| Durée | 51,712 s (la vidéo fait 51,650 s) |
| Loudness intégré | −16,3 LUFS (cible web/réseaux sociaux typique) |
| LRA | 5,1 LU (mix très compressé, peu de dynamique) |
| True peak | −4,4 dBFS ; peak −5,0 dBFS ; RMS global −20,1 dBFS |
| Tempo estimé | **120 BPM** (période 0,500 s = 30 images à 60 fps), par autocorrélation des onsets graves |

Fichiers produits (`docs/analysis/`) :
- `audio_overview.png` : spectrogramme 0–12 kHz, énergies par bande, courbe
  d'onsets (points rouges), coupes de scènes en cyan ;
- `audio_onsets.csv` : 317 onsets (temps, image, force, bande dominante) ;
- `audio_envelope.csv` : RMS et énergies par bande toutes les 100 ms ;
- `audio_tempo.txt`, `audio_sync.txt`.

## Structure observée (spectre + enveloppes)

| Temps | Observation technique | Interprétation (hypothèse) |
|---|---|---|
| 0,0–0,3 s | montée d'énergie très rapide, transitoires aigus à 0,21 et 0,36 s | attaque d'ouverture / impact sur l'apparition de « OK » |
| 0–12 s | ligne tonale stable vers 600–700 Hz + harmoniques graves, transitoires réguliers | nappe musicale + rythmique |
| 0–25 s | structures harmoniques à contours courbes (intonation) dans 150–3 000 Hz | probablement une **voix off** (non confirmé à l'écoute) |
| ~5,6–5,8 s | trou d'énergie bref | respiration/coupe musicale avant l'arrivée de la carte Victor (f346) |
| 13,9–15,6 s | énergie surtout grave, quasi-silence au-dessus de 3 kHz, balayage descendant | chute de l'email (S08) : son de chute / ralenti, puis impact |
| 21,5–23,3 s | plancher d'onsets élevé et continu, bruit large bande 2–8 kHz | **bourdonnement** du moustique (« bzzzz ») |
| 27,5–28,6 s | transitoires forts | lance-flammes |
| 28,6–29,1 s | bande sombre (quasi silence) | coïncide avec l'écran noir S12 |
| 41,8–42,0 s | trou d'énergie | avant « Plus de réponses » (f2519 : onset fort 0,79) |
| 48,5–49,0 s | chute brutale des aigus, puis seuls les graves/médiums restent | fin de la musique, carte URL |
| 49–51,7 s | onsets épars et faibles | queue de fin (réverbération / derniers mots) |

## Synchronisation son ↔ image

`docs/analysis/audio_sync.txt` croise 54 événements visuels (coupes + actions
mesurées) avec les onsets :

- **42 / 54 événements** ont un onset audio à ±4 images (±67 ms). Exemples
  forts : carte Victor qui atterrit f366 (+21 ms, force 0,88), popup posé f779
  (−2 ms, 0,72), coupe S08 f836 (+38 ms, 0,80), coupe « vous êtes » f1072
  (−66 ms, 0,79), lance-flammes f1652 (−52 ms, 0,61), « Plus » f2519
  (−22 ms, 0,79), clic CTA f2784 (+41 ms, 0,69).
- Seuls 26 % du poids des onsets forts tombent sur une grille stricte de
  120 BPM : le montage suit les **événements sonores** (voix/SFX) plus qu'une
  grille de mesures.
- Les clics (« Envoyer » f530, « Démarrer » f1974, CTA f2784) ont un transitoire
  proche (−82 / −59 / +41 ms), cohérent avec des sons de clic légèrement en
  avance/retard sur la frappe visuelle.

## Utilisation dans la reconstruction

- Le rendu final **réutilise la piste audio source** (copie bit à bit du flux
  AAC, `-c:a copy`) : ce n'est **pas** une recréation. Aucune séparation
  musique / voix / effets n'a été faite ni n'est disponible (aucune piste
  séparée fournie).
- La synchronisation est garantie par construction : timeline identique image
  pour image (60 fps, 3 099 images, départ à 0).
- Fichier : `assets/audio/source-mix.m4a` (extrait sans ré-encodage du MP4 fourni).
