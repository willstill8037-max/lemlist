# Assets et provenance

| Fichier | Nature | Provenance | Statut |
|---|---|---|---|
| `assets/fonts/inter-latin-wght-normal.woff2`, `inter-latin-ext-wght-normal.woff2` | police variable Inter 100–900 | paquet npm `@fontsource-variable/inter@5.3.0` (OFL-1.1, licence copiée dans `Inter-OFL-LICENSE.txt`) | **équivalent visuel** : la police originale n'est pas identifiée avec certitude ; Inter reproduit les largeurs d'encre mesurées à ±1 % |
| `assets/audio/source-mix.m4a` | mix stéréo AAC | extrait sans ré-encodage de la vidéo fournie (`ffmpeg -c:a copy`) | **audio source réutilisé** |
| `assets/images/avatar-victor.png` | photo ronde 74 px | extraite de la vidéo, image f406, centre (641,5 ; 470,5), r = 36,5 px (`tools/extract_avatar.py`) | raster à la définition d'origine (agrandie en S07/S13 → légèrement floue) |
| `assets/images/avatar-woman.png` | photo ronde 152 px (prospecte, fond gris) | vidéo, f406, centre (964 ; 271,5), r = 76 px | idem |
| `assets/images/avatar-woman-grey-lg.png` | photo ronde 208 px | vidéo, f988, centre (977 ; 435,5), r = 103,5 px (plus grande occurrence) | idem |
| `assets/images/avatar-woman-red.png` | photo ronde 140 px, fond rouge | vidéo, f1112, centre (972,5 ; 466,5), r = 69,5 px | idem |

## Éléments reconstruits (vectoriel / HTML, pas d'image extraite)

| Élément | Implémentation | Fidélité |
|---|---|---|
| Logo lemlist (carré bleu + « L » et barres) | `src/components/Logo.js` (SVG redessiné d'après f1787, 84 px) | redessin mesuré, **pas** le fichier officiel de la marque |
| Anneau, « OK », « 60.S » extrudés | `Ring.js`, `Extruded.js` (CSS 3D) | approximation d'un rendu 3D (pas d'ombrage physique) |
| Réveils | `AlarmClock.js` (SVG) | redessin simplifié d'objets 3D |
| Éclats (starbursts) | `Starburst.js` (polygone seedé) | forme approximée, timing mesuré |
| Cube | `Cube.js` (6 faces CSS 3D) | biseaux/reflets non reproduits |
| Site web lemlist | `Website.js` (HTML) | textes exacts, positions de f300 ; icônes de badges simplifiées |
| Fenêtres email, inbox, tableau, calendrier, séquence, cartes de réponse | `EmailComposer.js`, `Inbox.js`, `LeadsTable.js`, `Flow.js`, `ReplyCard.js`, `AppTable.js`, `PromptCard.js`, `MailCard.js` | textes exacts ; avatars des lignes de tableau et logos d'entreprises remplacés par des pastilles colorées (sources trop petites / en perspective) |
| Icône Gmail | `Inbox.js` `gmailSvg()` | redessin simplifié (multicolore) |
| Moustique | `Mosquito.js` (SVG + ailes animées) | **approximation** d'un modèle 3D animé |
| Couronne, étincelles, flammes | `Crown.js`, `Sparkle.js`, `Flame.js` | redessins ; flamme procédurale bouclant sur 24 images comme l'original, forme différente |
| Curseurs | `Cursor.js` | flèche macOS et flèche de navigation redessinées |
| Fonds | `Background.js` | gradients et grille ajustés numériquement (erreur < 1 niveau) |

Aucune capture de scène complète n'est utilisée comme décor : seules les
photos d'avatars sont des rasters extraits.
