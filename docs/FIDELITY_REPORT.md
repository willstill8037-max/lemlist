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
| Audio | flux AAC source **copié sans ré-encodage** (`-c:a copy`) → synchronisation exacte par construction | `scripts/render.mjs` |
| Déterminisme | voir §4 (deux sessions Chromium, deux ordres de seek, comparaison octet par octet) | `npm run check` |
| Coupes | les 21 scènes commencent/finissent aux images de coupe mesurées (§ ANALYSIS) | `src/timeline.json` |
| Métriques image par image | voir §2 | `python tools/fidelity_metrics.py` |

## 2. Mesures sur toute la vidéo

METRICS_PLACEHOLDER

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

DETERMINISM_PLACEHOLDER

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
