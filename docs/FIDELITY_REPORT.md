# Rapport de fidélité

Ce rapport est factuel : il distingue ce qui a été **mesuré et vérifié**, ce qui
est **estimé**, et ce qui **diffère** encore de la référence. La reconstruction
n'est **pas** identique à 100 % ; l'objectif atteint est une correspondance
mesurée des compositions, textes, timings et trajectoires, avec des écarts
connus listés ci-dessous.

## 1. Vérifications globales

| Contrôle | Résultat | Comment le reproduire |
|---|---|---|
| Format | 1920×1080, 60 fps, 3 099 images, H.264 yuv420p BT.709 — identique à la source | `ffprobe renders/lemlist_reconstruction.mp4` |
| Durée | vidéo 51,650 s ; audio 51,712 s (flux source copié) | idem |
| Audio | flux AAC source **copié sans ré-encodage** : MD5 des paquets audio identique à la source (`fe5128fa…`), 2 424 trames AAC, 51,712 s | `ffmpeg -i X -map 0:a -c copy -f md5 -` |
| Déterminisme | 17/17 images identiques octet pour octet (voir §4) | `npm run check` |
| Coupes | les 21 scènes commencent/finissent aux images de coupe mesurées (§ ANALYSIS) | `src/timeline.json` |
| Métriques image par image | voir §2 | `python tools/fidelity_metrics.py` |

## 2. Mesures sur toute la vidéo

Sur les 3 099 images (`docs/analysis/fidelity_per_frame.csv`, courbe `fidelity_curve.png`) : **MAE moyenne 5.55 / 255**, **PSNR médian 25.9 dB**, **edge-IoU moyen 0.395**. 60 % des images ont une MAE < 5, 86 % < 10.

| Scène | Images | MAE moy. | PSNR méd. (dB) | edge-IoU moy. | Pire image (MAE) |
|---|---|---|---|---|---|
| s01 OK ring fly-through | 0–52 | 11.21 | 17.89 | 0.168 | f52 (47.16) |
| s02 60 s → pour vous expliquer | 52–135 | 11.87 | 18.07 | 0.305 | f52 (47.16) |
| s03 Pourquoi ? | 136–154 | 1.71 | 33.29 | 0.637 | f136 (2.42) |
| s04 3D lemlist cube | 155–203 | 7.78 | 23.72 | 0.283 | f158 (87.93) |
| s05 lemlist pill + website | 204–369 | 2.97 | 26.99 | 0.663 | f369 (5.92) |
| s06 Victor email composer | 346–545 | 2.03 | 33.23 | 0.707 | f369 (5.92) |
| s07 Spam inbox | 546–835 | 6.97 | 23.84 | 0.292 | f799 (13.65) |
| s08 Falling email, pile | 836–939 | 7.75 | 27.19 | 0.085 | f843 (11.82) |
| s09 Et oui… vous n'êtes plus un.e pro de la vente → mosquito | 940–1214 | 2.19 | 31.23 | 0.675 | f1203 (5.18) |
| s10 Mosquito hovering – bzzzz | 1215–1509 | 1.83 | 32.26 | 0.227 | f1394 (4.10) |
| s11 et c'est exactement → bzzzz + flamethrower | 1510–1716 | 9.79 | 23.49 | 0.231 | f1510 (31.25) |
| s12 Black | 1717–1747 | 0.00 | 84.03 | 1.000 | f1717 (0.00) |
| s13 lemlist pill – Vous contactez les bonnes personnes | 1748–1891 | 4.58 | 23.58 | 0.413 | f1890 (9.35) |
| s14 Prompt typing + Démarrer | 1892–1995 | 3.23 | 27.66 | 0.249 | f1916 (4.69) |
| s15 Leads table, buying signal | 1996–2159 | 7.78 | 20.24 | 0.323 | f2020 (10.29) |
| s16 Blue flow: signal → AI email → Gmail → sequence tree | 2160–2384 | 7.69 | 25.74 | 0.309 | f2384 (18.51) |
| s17 Résultat | 2385–2434 | 5.69 | 26.75 | 0.169 | f2434 (7.82) |
| s18 LinkedIn reply → fan of replies → Plus de réponses | 2435–2585 | 9.66 | 21.32 | 0.277 | f2585 (26.69) |
| s19 Calendar – demos booked | 2586–2694 | 14.06 | 18.43 | 0.232 | f2586 (31.79) |
| s20 Outro – lemlist pill + CTA + app table | 2695–2914 | 3.97 | 23.74 | 0.436 | f2766 (5.77) |
| s21 Outro – www.lemlist.fr | 2915–3098 | 1.58 | 31.78 | 0.629 | f2945 (1.72) |

Les scènes les plus éloignées (S01–S02, S11, S18–S19) sont celles qui contiennent des rendus 3D (anneau, éclats, réveils), un effet procédural (flamme) ou des mouvements relevés avec moins de précision (éventail et aspiration des cartes). Les scènes d'interface et de typographie (S03, S05, S06, S09, S10, S21) sont à MAE ≈ 1,6–3.
Les planches `docs/analysis/contact_sheets/sNN.jpg` montrent référence | reconstruction aux mêmes instants pour chaque scène.

Lecture des métriques : la MAE (erreur absolue moyenne, 0–255) et le PSNR sont
dominés par les grands aplats (fonds), qui sont très proches ; ils
**n'attestent pas** à eux seuls de la justesse des mouvements. L'« edge IoU »
(recouvrement des contours dilatés de 2 px) est plus sensible à la position des
textes et formes, mais pénalise aussi les différences de netteté (flou de
mouvement, défocalisation). Les mosaïques image par image
(`node scripts/compare.mjs`) et la vidéo côte à côte
(`renders/compare_side_by_side.mp4`) restent la référence pour juger.

## 3. Ce qui a été vérifié (mosaïques référence / reconstruction / différence)

Vérifié image par image ou toutes les 2–6 images sur les mouvements rapides :

- **Textes** : tous les textes visibles sont repris mot pour mot (y compris
  « un.e », « Découvrez notre solution », contenus des emails, du tableau, de
  la séquence, des réponses, des événements du calendrier, URL), avec les
  mêmes retours à la ligne.
- **Métriques typographiques** : tailles résolues sur les largeurs d'encre
  mesurées (écart ≤ 1–2 % sur les lignes de titre) ; positions des lignes de
  base au pixel près sur les plans fixes (S03, S09, S13, S17, S21).
- **Trajectoires et échelles** des éléments principaux : anneau (S01, largeur
  et ellipse image par image), recul S02, cube S04, pilule S05/S13/S20, carte
  Victor S06 (soulignement suivi toutes les 2 images), caméra S07, carte qui
  tombe S08, avatar/couronne S09, caméras S14/S16, homographie du tableau S15.
- **Instants d'événements** : saisies (caractères visibles par image),
  sélections de lignes S07 (image exacte), mots ajoutés S09/S13/S18/S20,
  clignotement du curseur S21 (période 30 images mesurée), clics.
- **Fonds** : gradients et grille de points ajustés (erreur moyenne < 1
  niveau sur les zones dégagées des images f2990, f960, f2410).
- **Cadence particulière** : lignes de vitesse S08 à 30 i/s reproduites.

## 4. Déterminisme

`npm run check` (`scripts/check-determinism.mjs`) : 17 images réparties sur
toutes les scènes, rendues dans deux sessions Chromium indépendantes, dans deux
ordres de seek différents (croissant / mélangé) → **17/17 identiques octet pour
octet**. En plus, 4 images (f50, f120, f1000, f2500) rendues isolément avec
`render.mjs --frame N` sont identiques aux images du rendu complet. Le rendu
complet a été fait en plusieurs passes (`--reuse`) sans aucune différence aux
raccords, ce qui confirme qu'une image ne dépend pas de l'historique.

## 5. Assets réutilisés ou reconstruits

Voir `docs/ASSETS.md`. Réutilisés depuis la vidéo : piste audio (mix complet),
4 photos d'avatars (extraites à leur plus grande occurrence nette). Tout le
reste est reconstruit (HTML/CSS/SVG) ; la police Inter est un équivalent
visuel non certifié de la police d'origine.

## 6. Éléments estimés

- Trajectoires relevées sur des planches au 1/4 (±8 px) pour S10, S11 (texte
  qui tombe), S18 (éventail), S19 (calendrier), S20 (pointeur).
- Courbes entre points de mesure : interpolation linéaire des échantillons
  (la courbe réelle entre deux mesures espacées de 2–6 images est inconnue).
- Inclinaisons 3D (S01 « OK », S02 texte, S05 site, S06 atterrissage, S07
  bascule) : angles déduits de la forme projetée, pas d'un modèle de caméra.
- Couleurs des éléments flous ou très petits (logos d'entreprises, avatars des
  lignes de tableau, icônes de canaux).
- Horaire du dernier événement du calendrier (« 12H30 - 13H00 ») : non lisible
  dans la source, déduit de la progression.

## 7. Écarts restants (connus)

| Scène | Écart | Cause |
|---|---|---|
| S01–S02 | anneau, « OK », « 60.S » sans ombrage/reflets physiques ; réveils simplifiés ; forme exacte des éclats différente | rendus 3D d'origine, reconstruits en CSS/SVG |
| S02 | légère différence de perspective de « pour vous expliquer » pendant f96–f110 | angle estimé |
| S04 | cube sans biseaux ni reflets spéculaires | idem |
| S05 | icônes des badges (Capterra/G2/SOC 2) simplifiées | trop petites pour être extraites proprement |
| S07 | bascule 3D f774–f835 et décollage du popup approximés | perspective estimée |
| S08 | pile d'emails : nombre/position des cartes approximés, flou différent | plan très flou |
| S09–S11 | moustique vectoriel (pas le modèle 3D animé), ailes procédurales | rendu 3D d'origine |
| S09 | désintégration de l'avatar : particules différentes en forme et en nombre | effet particulaire d'origine non reproductible exactement |
| S11 | lance-flammes procédural : même boucle (24 images), formes différentes | animation cel d'origine |
| S15 | avatars et logos du tableau remplacés par des pastilles | sources minuscules en perspective |
| S16 | séquence sans la légère perspective visible en f2380 | aplat 2D |
| S18–S19 | contenu des cartes de réponse peu lisibles (Mia Harper, Ella Parker…) remplacé par des barres grises ; positions relevées au 1/4 | flou de la source |
| Partout | flou de mouvement approximé par sur-échantillonnage temporel (4–8 sous-images) sur les plages listées dans `timeline.json` | l'original a un flou de rendu continu |
| Audio | mix original réutilisé ; aucun effet/musique recréé ; présence d'une voix off **non vérifiée** à l'écoute | contrainte de l'environnement |

## 8. Corrections faites après comparaison

| Problème constaté | Correction | Effet mesuré |
|---|---|---|
| Rendu complet : l'audio était coupé à la dernière image vidéo (51,648 s) | `-frames:v` retiré pour le rendu complet | audio 51,712 s, MD5 identique à la source |
| S18 : l'éventail des réponses suivait une trajectoire inventée (zoom ×0,5) | chaîne `Q + j·D` mesurée image par image (f2490–f2522), carte Chloe sortant de la pile | f2498 MAE 13 → 4 |
| S19 : les réponses étaient aspirées vers des cibles fausses | regroupement en colonne mesurée (x 623) puis glissement dans le calendrier | f2640 MAE 29 → 11 |
| S07 : sélection des lignes en retard de 2 images | la ligne est entièrement rouge à l'image d'événement mesurée | f586 conforme |
| S07 : bascule finale trop faible | roulis −9° → −11° | f835 MAE 13,9 → 12,2 |
| S01/S02 : largeur de base du texte mesurée avec `getBoundingClientRect` (dépendait de l'échelle d'aperçu) | `offsetWidth` (indépendant des transformations) | aperçu et rendu identiques |
